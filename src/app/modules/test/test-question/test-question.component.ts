import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { QuestionCardComponent } from '../../../shared/components/question-card/question-card.component';
import { TestService } from '../../../core/services/test.service';
import { QuestionService } from '../../../core/services/question.service';
import { Question } from '../../../core/models/question.interface';

@Component({
  selector: 'app-test-question',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    QuestionCardComponent
  ],
  templateUrl: './test-question.component.html',
  styleUrl: './test-question.component.css'
})
export class TestQuestionComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly testService = inject(TestService);
  private readonly questionService = inject(QuestionService);

  currentQuestionNumber = signal<number>(1);
  currentQuestion = signal<Question | null>(null);
  allQuestions = signal<Question[]>([]);
  selectedAnswer = signal<string | null>(null);
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  errorMessage = signal<string>('');

  totalQuestions = 19;

  // Computed properties
  progress = computed(() => {
    return (this.currentQuestionNumber() / this.totalQuestions) * 100;
  });

  isLastQuestion = computed(() => {
    return this.currentQuestionNumber() === this.totalQuestions;
  });

  canContinue = computed(() => {
    return this.selectedAnswer() !== null && !this.isSaving();
  });

  ngOnInit(): void {
    // Obtener el número de pregunta de la ruta
    this.route.params.subscribe(params => {
      const questionNumber = parseInt(params['number'], 10);
      this.currentQuestionNumber.set(questionNumber);
      this.loadQuestions();
    });
  }

  private loadQuestions(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    // Verificar si hay un test en progreso
    const currentTest = this.testService.currentTest();
    if (!currentTest) {
      this.errorMessage.set('No hay un test en progreso');
      this.router.navigate(['/test/start']);
      return;
    }

    // Verificar si las preguntas ya están cargadas en el signal
    const cachedQuestions = this.questionService.questions();

    if (cachedQuestions.length > 0) {
      // Usar preguntas cacheadas
      this.loadQuestionFromCache(cachedQuestions, currentTest.id);
    } else {
      // Cargar preguntas del backend (fallback por si no se cargaron en /test/start)
      this.questionService.getActiveQuestions().subscribe({
        next: (questions) => {
          this.loadQuestionFromCache(questions, currentTest.id);
        },
        error: (error) => {
          console.error('Error al cargar preguntas:', error);
          this.errorMessage.set('Error al cargar las preguntas');
          this.isLoading.set(false);
        }
      });
    }
  }

  private loadQuestionFromCache(questions: Question[], testId: number): void {
    // Ordenar por order para asegurar el orden correcto
    const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
    this.allQuestions.set(sortedQuestions);

    // Obtener la pregunta actual por índice
    const questionIndex = this.currentQuestionNumber() - 1;

    if (questionIndex >= 0 && questionIndex < sortedQuestions.length) {
      const currentQuestion = sortedQuestions[questionIndex];
      this.currentQuestion.set(currentQuestion);

      // Cargar respuesta del caché si existe
      const cachedAnswer = this.testService.getCachedAnswer(testId, currentQuestion.id);
      if (cachedAnswer) {
        this.selectedAnswer.set(cachedAnswer);
      }
    } else {
      this.errorMessage.set('Pregunta no encontrada');
    }

    this.isLoading.set(false);
  }

  onAnswerSelected(answer: string): void {
    this.selectedAnswer.set(answer);
  }

  continue(): void {
    if (!this.canContinue()) return;

    const currentTest = this.testService.currentTest();
    if (!currentTest) {
      this.router.navigate(['/test/start']);
      return;
    }

    const question = this.currentQuestion();
    if (!question) return;

    // Guardar respuesta en localStorage (NO hacer petición HTTP aún)
    this.testService.saveResponseToCache(
      currentTest.id,
      question.id,
      this.selectedAnswer()!
    );

    if (this.isLastQuestion()) {
      // Última pregunta - enviar batch y completar
      this.submitAllResponsesAndComplete(currentTest.id);
    } else {
      // Navegar a siguiente pregunta inmediatamente (sin HTTP)
      const nextQuestionNumber = this.currentQuestionNumber() + 1;
      this.selectedAnswer.set(null);
      this.router.navigate(['/test/question', nextQuestionNumber]);
    }
  }

  private submitAllResponsesAndComplete(testId: number): void {
    this.isSaving.set(true);
    this.errorMessage.set('');

    // 1. Obtener todas las respuestas del caché
    const cachedResponses = this.testService.getCachedResponses(testId);
    const questions = this.allQuestions();

    // 2. Construir array de respuestas para el batch
    const responses = questions.map(q => ({
      question_id: q.id,
      answer_value: cachedResponses[q.id] || ''
    }));

    // Verificar que tengamos las 19 respuestas
    if (responses.length !== 19 || responses.some(r => !r.answer_value)) {
      this.isSaving.set(false);
      this.errorMessage.set('Faltan respuestas. Por favor, completa todas las preguntas.');
      return;
    }

    // 3. Enviar batch de respuestas
    this.testService.submitResponsesBatch(testId, { responses }).subscribe({
      next: () => {
        // 4. Completar el test (llamar al ML)
        this.testService.completeTest(testId).subscribe({
          next: (result) => {
            // 5. Limpiar caché
            this.testService.clearCachedResponses(testId);
            this.isSaving.set(false);

            // 6. Navegar a resultados
            this.router.navigate(['/test', testId, 'result']);
          },
          error: (error) => {
            console.error('Error al completar test:', error);
            this.isSaving.set(false);
            this.errorMessage.set('Error al procesar el test. Intenta nuevamente.');
          }
        });
      },
      error: (error) => {
        console.error('Error al enviar respuestas:', error);
        this.isSaving.set(false);
        this.errorMessage.set('Error al guardar las respuestas. Intenta nuevamente.');
      }
    });
  }

  goBack(): void {
    if (this.currentQuestionNumber() > 1) {
      const prevQuestionNumber = this.currentQuestionNumber() - 1;
      this.selectedAnswer.set(null);
      this.router.navigate(['/test/question', prevQuestionNumber]);
    } else {
      this.router.navigate(['/test/start']);
    }
  }
}

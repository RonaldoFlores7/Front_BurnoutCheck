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

    // Cargar todas las preguntas activas
    this.questionService.getActiveQuestions().subscribe({
      next: (questions) => {
        // Ordenar por order
        const sortedQuestions = questions.sort((a, b) => a.order - b.order);
        this.allQuestions.set(sortedQuestions);

        // Obtener la pregunta actual
        const questionIndex = this.currentQuestionNumber() - 1;
        if (questionIndex >= 0 && questionIndex < sortedQuestions.length) {
          this.currentQuestion.set(sortedQuestions[questionIndex]);
        } else {
          this.errorMessage.set('Pregunta no encontrada');
        }

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar preguntas:', error);
        this.errorMessage.set('Error al cargar las preguntas');
        this.isLoading.set(false);
      }
    });
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

    this.isSaving.set(true);
    this.errorMessage.set('');

    // Guardar respuesta
    this.testService.submitResponse(currentTest.id, {
      question_id: question.id,
      answer_value: this.selectedAnswer()!
    }).subscribe({
      next: () => {
        this.isSaving.set(false);

        if (this.isLastQuestion()) {
          // Última pregunta - completar test
          this.completeTest(currentTest.id);
        } else {
          // Navegar a siguiente pregunta
          const nextQuestionNumber = this.currentQuestionNumber() + 1;
          this.selectedAnswer.set(null);
          this.router.navigate(['/test/question', nextQuestionNumber]);
        }
      },
      error: (error) => {
        console.error('Error al guardar respuesta:', error);
        this.isSaving.set(false);
        this.errorMessage.set('Error al guardar la respuesta. Intenta nuevamente.');
      }
    });
  }

  private completeTest(testId: number): void {
    this.isSaving.set(true);

    this.testService.completeTest(testId).subscribe({
      next: (result) => {
        this.isSaving.set(false);
        // Navegar a resultados
        this.router.navigate(['/test', testId, 'result']);
      },
      error: (error) => {
        console.error('Error al completar test:', error);
        this.isSaving.set(false);
        this.errorMessage.set('Error al completar el test. Intenta nuevamente.');
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

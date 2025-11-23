import { Component, Input, Output, EventEmitter, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Question } from '../../../core/models/question.interface';

@Component({
  selector: 'app-question-card',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule
  ],
  templateUrl: './question-card.component.html',
  styleUrl: './question-card.component.css'
})
export class QuestionCardComponent implements OnChanges {
  @Input() question!: Question;
  @Input() questionNumber: number = 1;
  @Input() preSelectedAnswer: string | null = null; // Nueva prop
  @Output() answerSelected = new EventEmitter<string>();

  selectedAnswer = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['preSelectedAnswer'] && this.preSelectedAnswer) {
      this.selectedAnswer.set(this.preSelectedAnswer);
    }

    if (changes['question'] && !this.preSelectedAnswer) {
      this.selectedAnswer.set(null);
    }
  }

  selectAnswer(optionValue: string): void {
    this.selectedAnswer.set(optionValue);
    this.answerSelected.emit(optionValue);
  }

  isSelected(optionValue: string): boolean {
    return this.selectedAnswer() === optionValue;
  }
}
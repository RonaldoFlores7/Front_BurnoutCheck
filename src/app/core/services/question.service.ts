import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Question } from '../models/question.interface';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.api}/questions`;

  questions = signal<Question[]>([]);

  getActiveQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/active`).pipe(
      tap(questions => {
        this.questions.set(questions);
      })
    );
  }

  getQuestionById(questionId: number): Observable<Question> {
    return this.http.get<Question>(`${this.apiUrl}/${questionId}`);
  }
}

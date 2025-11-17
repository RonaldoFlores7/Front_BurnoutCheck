import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Recommendation, TestResult } from '../models/test.interface';
import { TestService } from './test.service';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private readonly http = inject(HttpClient);
  private readonly testService = inject(TestService);
  private readonly apiUrl = `${environment.api}/tests`;

  // Signal para mantener las recomendaciones del último test
  recommendations = signal<Recommendation[]>([]);
  hasRecommendations = signal<boolean>(false);

  getLastTestRecommendations(): Observable<Recommendation[]> {
    return new Observable<Recommendation[]>(observer => {
      this.testService.getMyTests().subscribe({
        next: (tests) => {
          if (tests.length === 0) {
            this.recommendations.set([]);
            this.hasRecommendations.set(false);
            observer.next([]);
            observer.complete();
            return;
          }

          // Obtener el último test completado
          const lastTest = tests
            .filter(test => test.status === 'completed')
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

          if (!lastTest) {
            this.recommendations.set([]);
            this.hasRecommendations.set(false);
            observer.next([]);
            observer.complete();
            return;
          }

          // Obtener resultado con recomendaciones
          this.testService.getTestResult(lastTest.id).subscribe({
            next: (result: TestResult) => {
              const recs = result.recommendations || [];
              this.recommendations.set(recs);
              this.hasRecommendations.set(recs.length > 0);
              observer.next(recs);
              observer.complete();
            },
            error: (error) => {
              this.recommendations.set([]);
              this.hasRecommendations.set(false);
              observer.error(error);
            }
          });
        },
        error: (error) => {
          this.recommendations.set([]);
          this.hasRecommendations.set(false);
          observer.error(error);
        }
      });
    });
  }
}

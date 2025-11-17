import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { TestService } from '../../core/services/test.service';
import { Test, TestResult } from '../../core/models/test.interface';

interface TestWithResult {
  test: Test;
  result: TestResult | null;
  isLatest: boolean;
}

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})
export class ResultComponent implements OnInit {
  private readonly testService = inject(TestService);
  private readonly router = inject(Router);

  testsWithResults = signal<TestWithResult[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  hasTests = computed(() => this.testsWithResults().length > 0);

  ngOnInit(): void {
    this.loadTests();
  }

  private loadTests(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.testService.getMyTests().subscribe({
      next: (tests) => {
        // Filtrar solo tests completados
        const completedTests = tests
          .filter(test => test.status === 'completed')
          .sort((a, b) => new Date(b.completed_at || b.created_at).getTime() - new Date(a.completed_at || a.created_at).getTime());

        if (completedTests.length === 0) {
          this.testsWithResults.set([]);
          this.isLoading.set(false);
          return;
        }

        // Cargar resultados para cada test
        const testPromises = completedTests.map((test, index) => {
          return new Promise<TestWithResult>((resolve) => {
            this.testService.getTestResult(test.id).subscribe({
              next: (result) => {
                resolve({
                  test,
                  result,
                  isLatest: index === 0
                });
              },
              error: () => {
                resolve({
                  test,
                  result: null,
                  isLatest: index === 0
                });
              }
            });
          });
        });

        Promise.all(testPromises).then((testsWithResults) => {
          this.testsWithResults.set(testsWithResults);
          this.isLoading.set(false);
        });
      },
      error: (error) => {
        console.error('Error al cargar tests:', error);
        this.errorMessage.set('Error al cargar el historial de tests');
        this.isLoading.set(false);
      }
    });
  }

  viewTestDetail(testId: number): void {
    this.router.navigate(['/test', testId, 'result']);
  }

  goToTest(): void {
    this.router.navigate(['/test/start']);
  }

  getStatusBadge(prediction: string): string {
    return prediction === 'SI' ? 'Sí' : 'No';
  }

  isPositive(prediction: string): boolean {
    return prediction === 'SI';
  }

  getFormattedDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      timeZone: 'America/Lima',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      //hour: '2-digit',
      //minute: '2-digit'
    });
  }
}

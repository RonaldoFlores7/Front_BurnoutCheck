import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WelcomeCardComponent } from '../../shared/components/welcome-card/welcome-card.component';
import { ResultCardComponent } from '../../shared/components/result-card/result-card.component';
import { AuthService } from '../../core/services/auth.service';
import { TestService } from '../../core/services/test.service';
import { UserService } from '../../core/services/user.service';
import { TestResult } from '../../core/models/test.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    WelcomeCardComponent,
    ResultCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly testService = inject(TestService);
  private readonly router = inject(Router);

  userName = signal<string>('Usuario');
  lastTestResult = signal<TestResult | null>(null);
  isLoading = signal<boolean>(true);
  hasTests = signal<boolean>(false);

  ngOnInit(): void {
    this.loadUserData();
    this.loadLastTestResult();
  }

  private loadUserData(): void {
    // Intentar obtener el nombre del usuario actual
    const currentUser = this.authService.currentUser();

    if (currentUser && currentUser.name) {
      this.userName.set(currentUser.name);
    } else {
      // Si no está cargado, hacer llamada al backend
      this.userService.getProfile().subscribe({
        next: (user) => {
          this.userName.set(user.name || user.username);
        },
        error: (error) => {
          console.error('Error al cargar perfil:', error);
          this.userName.set('Usuario');
        }
      });
    }
  }

  private loadLastTestResult(): void {
    this.isLoading.set(true);

    this.testService.getMyTests().subscribe({
      next: (tests) => {
        if (tests.length === 0) {
          this.hasTests.set(false);
          this.lastTestResult.set(null);
          this.isLoading.set(false);
          return;
        }

        this.hasTests.set(true);

        // Obtener el último test completado
        const completedTests = tests.filter(test => test.status === 'completed');

        if (completedTests.length === 0) {
          this.lastTestResult.set(null);
          this.isLoading.set(false);
          return;
        }

        // Ordenar por fecha y obtener el más reciente
        const lastTest = completedTests.sort((a, b) =>
          new Date(b.completed_at || b.created_at).getTime() -
          new Date(a.completed_at || a.created_at).getTime()
        )[0];

        // Obtener el resultado del último test
        this.testService.getTestResult(lastTest.id).subscribe({
          next: (result) => {
            this.lastTestResult.set(result);
            this.isLoading.set(false);
          },
          error: (error) => {
            console.error('Error al cargar resultado:', error);
            this.lastTestResult.set(null);
            this.isLoading.set(false);
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar tests:', error);
        this.hasTests.set(false);
        this.lastTestResult.set(null);
        this.isLoading.set(false);
      }
    });
  }

  navigateToTest(): void {
    this.router.navigate(['/test/start']);
  }

  viewAllResults(): void {
    // Por ahora, como no hay página separada de resultados,
    // podríamos mostrar el último resultado o redirigir a test
    if (this.lastTestResult()) {
      const testId = this.lastTestResult()?.test_id;
      this.router.navigate([`/test/${testId}/result`]);
    }
  }
}

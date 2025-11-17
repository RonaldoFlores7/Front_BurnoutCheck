import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RecommendationCardComponent } from '../../shared/components/recommendation-card/recommendation-card.component';
import { RecommendationService } from '../../core/services/recommendation.service';
import { Recommendation } from '../../core/models/test.interface';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RecommendationCardComponent
  ],
  templateUrl: './recommendation.component.html',
  styleUrl: './recommendation.component.css'
})
export class RecommendationComponent implements OnInit {
  private readonly recommendationService = inject(RecommendationService);
  private readonly router = inject(Router);

  recommendations = signal<Recommendation[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  ngOnInit(): void {
    this.loadRecommendations();
  }

  private loadRecommendations(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.recommendationService.getLastTestRecommendations().subscribe({
      next: (recommendations) => {
        this.recommendations.set(recommendations);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar recomendaciones:', error);
        this.errorMessage.set('Error al cargar las recomendaciones');
        this.isLoading.set(false);
      }
    });
  }

  goToTest(): void {
    this.router.navigate(['/test/start']);
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }
}

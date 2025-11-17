import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Recommendation } from '../../../core/models/test.interface';

@Component({
  selector: 'app-recommendation-card',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './recommendation-card.component.html',
  styleUrl: './recommendation-card.component.css'
})
export class RecommendationCardComponent {
  @Input() recommendations: Recommendation[] = [];
}

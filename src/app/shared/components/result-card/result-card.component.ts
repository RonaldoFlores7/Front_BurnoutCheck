import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestResult } from '../../../core/models/test.interface';

@Component({
  selector: 'app-result-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result-card.component.html',
  styleUrl: './result-card.component.css'
})
export class ResultCardComponent {
  @Input() result: TestResult | null = null;

  // Computed properties para mejorar la legibilidad
  hasResult = computed(() => this.result !== null);

  isPositive = computed(() => this.result?.prediction === 'SI');

  statusText = computed(() => {
    if (!this.result) return '';
    return this.result.prediction === 'SI'
      ? 'ALTO - Riesgo Significativo'
      : 'BAJO - Sin Riesgo Detectado';
  });

  statusBadge = computed(() => {
    if (!this.result) return '';
    return this.result.prediction === 'SI' ? 'Sí' : 'No';
  });

  descriptionText = computed(() => {
    if (!this.result) return '';

    return this.result.prediction === 'SI'
      ? 'Se identifican signos intensos de agotamiento académico. Es recomendable reducir la carga de trabajo, adoptar técnicas de organización y, de ser posible, contactar con un orientador universitario.'
      : 'No se detectan signos de agotamiento académico. Mantienes un buen equilibrio en tu vida académica. Continúa aplicando tus estrategias y cuida tu bienestar.';
  });

  formattedDate = computed(() => {
    if (!this.result) return '';

    const date = new Date(this.result.predicted_at);
    return date.toLocaleDateString('es-ES', {
      timeZone: 'America/Lima',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  });
}

import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome-card.component.html',
  styleUrl: './welcome-card.component.css'
})
export class WelcomeCardComponent {
  @Input() userName: string = '';

  // Computed signal para obtener las iniciales del nombre
  initials = computed(() => {
    if (!this.userName) return '?';

    const names = this.userName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    // Tomar primera letra del primer nombre y primer apellido
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  });
}

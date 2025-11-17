import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent {
  @Input() variant: 'public' | 'private' = 'private';

  navItems = [
    { label: 'INICIO', icon: 'home', route: '/home' },
    { label: 'PERFIL', icon: 'person', route: '/profile' },
    { label: 'TEST', icon: 'assignment', route: '/test/start' },
    { label: 'RESULTADOS', icon: 'bar_chart', route: '/results' },
    { label: 'RECOMENDACION', icon: 'groups', route: '/recommendation' }
  ];
}

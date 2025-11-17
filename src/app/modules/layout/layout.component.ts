import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToolbarComponent } from '../../shared/components/toolbar/toolbar.component';


@Component({
  selector: 'app-layout',
  imports: [
    CommonModule,
    RouterOutlet,
    ToolbarComponent
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {

}

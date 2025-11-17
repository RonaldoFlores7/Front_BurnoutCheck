import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { TestService } from '../../../core/services/test.service';

@Component({
  selector: 'app-test-start',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatRadioModule
  ],
  templateUrl: './test-start.component.html',
  styleUrl: './test-start.component.css'
})
export class TestStartComponent {
  private readonly fb = inject(FormBuilder);
  private readonly testService = inject(TestService);
  private readonly router = inject(Router);

  testForm: FormGroup;
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  // Opciones para los selects
  ciclos = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  generos = ['Masculino', 'Femenino'];

  facultades = [
    'Ingeniería (Sistemas / Software / Informática / Industrial / Civil / Mecánica / Eléctrica / Ambiental / Biomédica / etc.)',
    'Ciencias de la Salud (Medicina Humana, Odontología, Enfermería, Psicología, Nutrición, Tecnología Médica, Farmacia y Bioquímica)',
    'Ciencias Empresariales / Económicas (Administración de Empresas, Contabilidad, Economía, Negocios Internacionales, Marketing, Finanzas)',
    'Ciencias Sociales y Humanidades (Derecho, Educación, Comunicaciones, Periodismo, Traducción e Interpretación, Humanidades, Ciencias Políticas, Trabajo Social)',
    'Arquitectura, Diseño y Artes (Arquitectura, Diseño Gráfico / Diseño Industrial, Diseño de Interiores, Artes Escénicas / Artes Visuales)'
  ];

  constructor() {
    this.testForm = this.fb.group({
      ciclo: [null, [Validators.required, Validators.min(1), Validators.max(10)]],
      genero: ['', Validators.required],
      facultad: ['', Validators.required],
      practicasprepro: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.testForm.invalid) {
      this.testForm.markAllAsTouched();
      return;
    }
    console.log(this.testForm);

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.testService.startTest(this.testForm.value).subscribe({
      next: (test) => {
        this.isLoading.set(false);
        // Navegar a la primera pregunta
        this.router.navigate(['/test/question', 1]);
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error al iniciar test:', error);
        this.errorMessage.set(
          error.error?.detail || 'Error al iniciar el test. Intenta nuevamente.'
        );
      }
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.testForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (field?.hasError('min') || field?.hasError('max')) {
      return 'Debe estar entre 1 y 10';
    }

    return '';
  }
}

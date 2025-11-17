import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { UserDetail } from '../../core/models/user.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly snackBar = inject(MatSnackBar);

  profileForm: FormGroup;
  user = signal<UserDetail | null>(null);
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  isEditMode = signal<boolean>(false);

  // Computed para obtener las iniciales
  initials = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return '?';

    const fullName = `${currentUser.name || ''} ${currentUser.lastname || ''}`.trim();
    if (!fullName) return currentUser.username.charAt(0).toUpperCase();

    const names = fullName.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  });

  constructor() {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.pattern(/^[0-9]{9,15}$/)]]
    });

    // Deshabilitar el formulario por defecto
    this.profileForm.disable();
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.isLoading.set(true);

    this.userService.getProfile().subscribe({
      next: (user) => {
        this.user.set(user);
        this.profileForm.patchValue({
          name: user.name || '',
          lastname: user.lastname || '',
          phone: user.phone || ''
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar perfil:', error);
        this.showNotification('Error al cargar perfil', 'error');
        this.isLoading.set(false);
      }
    });
  }

  toggleEditMode(): void {
    if (this.isEditMode()) {
      // Cancelar edición - restaurar valores originales
      const currentUser = this.user();
      if (currentUser) {
        this.profileForm.patchValue({
          name: currentUser.name || '',
          lastname: currentUser.lastname || '',
          phone: currentUser.phone || ''
        });
      }
      this.profileForm.disable();
      this.isEditMode.set(false);
    } else {
      // Activar modo edición
      this.profileForm.enable();
      this.isEditMode.set(true);
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    const updateData = {
      name: this.profileForm.value.name,
      lastname: this.profileForm.value.lastname,
      phone: this.profileForm.value.phone || undefined
    };

    this.userService.updateProfile(updateData).subscribe({
      next: (updatedUser) => {
        this.user.set({ ...this.user()!, ...updatedUser });
        this.profileForm.disable();
        this.isEditMode.set(false);
        this.isSaving.set(false);
        this.showNotification('Perfil actualizado correctamente', 'success');
      },
      error: (error) => {
        console.error('Error al actualizar perfil:', error);
        this.isSaving.set(false);
        this.showNotification('Error al actualizar perfil', 'error');
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.profileForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength']?.requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }

    if (field?.hasError('pattern')) {
      return 'Formato de teléfono inválido (9-15 dígitos)';
    }

    return '';
  }
}

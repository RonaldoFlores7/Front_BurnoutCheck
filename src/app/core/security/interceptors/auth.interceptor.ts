import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../../services/token.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = tokenService.getToken();

  // Clonar request y agregar token si existe
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Manejar errores de autenticación
  return next(authReq).pipe(
    catchError(error => {
      if (error.status === 401) {
        // Token inválido o expirado
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};

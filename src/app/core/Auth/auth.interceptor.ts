// src/app/core/auth/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, throwError } from 'rxjs';

const AUTH_WHITELIST = [
  '/api/auth/login',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-reset-token',
  '/api/usuarios/create'
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const url = req.url.toLowerCase();

  // No añadir Authorization a endpoints públicos
  if (!AUTH_WHITELIST.some((p) => url.includes(p))) {
    const token = auth.token; // soporta método o propiedad
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        // Token inválido/expirado → cerramos sesión
        auth.logout?.();
      } else if (err.status === 403) {
        // Sin permisos. Decide tu UX:
        // 1) auth.logout?.(); // si 403 también implica sesión inválida en tu backend
        // 2) this.toastr.warn('No tienes permisos'); // si quieres avisar sin cerrar sesión
      }
      return throwError(() => err);
    })
  );
};
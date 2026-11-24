import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './authservice.service';

// Solo exige que haya sesión. Los permisos por rol los valida el backend:
// si el rol no tiene acceso, la pantalla muestra el mensaje que devuelve la API.
export const rolGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

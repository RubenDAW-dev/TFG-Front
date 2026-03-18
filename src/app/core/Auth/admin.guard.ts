import { Injectable, inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
class AdminGuardService {
  private router = inject(Router);
  private authService = inject(AuthService);

  canActivate(): boolean {
    if (this.authService.isAdmin()) {
      return true;
    }
    this.router.navigate(['/home']);
    return false;
  }
}

export const adminGuard: CanActivateFn = () => {
  return inject(AdminGuardService).canActivate();
};
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/Auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar implements OnInit {
  private router = inject(Router);
  auth = inject(AuthService);

  mobileOpen = signal(false);

  ngOnInit() {
    // Si el usuario es admin y está en home, redirigir a admin
    this.checkAdminRedirect();
  }

  checkAdminRedirect() {
    if (this.auth.isAdmin() && this.router.url === '/home') {
      this.router.navigate(['/admin']);
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  logout() {
    this.auth.logout();
  }

  toggleMobile() {
    this.mobileOpen.set(!this.mobileOpen());
  }

  closeMobile() {
    this.mobileOpen.set(false);
  }

  navigateHome() {
    // Si es admin, ir a admin panel. Si no, ir a home
    if (this.auth.isAdmin()) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
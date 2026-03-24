import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { Footer } from './shared/footer/footer';
import { Navbar } from './shared/navbar/navbar';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true
})
export class App {
  private router = inject(Router);

  // señal reactiva para saber si ocultar
  hideLayoutSignal = signal(false);
  title = "FutStats360";

  constructor() {
  this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: any) => {
      const url = event.url.split('?')[0];
      this.hideLayoutSignal.set(
        url === '/login' ||
        url === '/register' ||
        url === '/forgot-password' ||
        url === '/reset-password'
      );
    });
}

  hideLayout() {
    return this.hideLayoutSignal();
  }
}
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

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.hideLayoutSignal.set(event.url === '/login' || event.url === '/register');
      });
  }

  hideLayout() {
    return this.hideLayoutSignal();
  }
}
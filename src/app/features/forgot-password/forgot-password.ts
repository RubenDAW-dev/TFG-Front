import { Component, inject, signal, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/Auth/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPassword{

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  enviado = signal(false);
  cargando = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  enviar() {
    this.error.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);

    const email = this.form.value.email!;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.cargando.set(false);
        this.enviado.set(true); // Mostrar mensaje de éxito
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set('Error inesperado. Inténtalo más tarde.');
        console.error(err);
      }
    });
  }
}
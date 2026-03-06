import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/Auth/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword implements OnInit {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Estados UI
  cargando = signal(true);          // mientras verificamos token
  tokenValido = signal(false);
  error = signal<string | null>(null);
  exito = signal(false);

  // Token capturado del query param
  token = signal<string | null>(null);

  form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: [this.passwordsIgualesValidator] });

  ngOnInit(): void {
    const t = this.route.snapshot.queryParamMap.get('token');
    this.token.set(t);

    if (!t) {
      this.cargando.set(false);
      this.tokenValido.set(false);
      this.error.set('Falta el token de recuperación.');
      return;
    }

    // Verificar token en backend
    this.authService.verifyResetToken(t).subscribe({
      next: () => {
        this.tokenValido.set(true);
        this.cargando.set(false);
      },
      error: () => {
        this.tokenValido.set(false);
        this.cargando.set(false);
        this.error.set('El enlace es inválido o ha caducado.');
      }
    });
  }

  enviar(): void {
    this.error.set(null);

    if (this.form.invalid || !this.token()) {
      this.form.markAllAsTouched();
      return;
    }

    const pwd = this.form.value.newPassword!;
    const token = this.token()!;

    // (Opcional) podrías mostrar un spinner del botón reutilizando 'cargando',
    // pero lo dejo simple para no mezclar estados:
    this.authService.resetPassword(token, pwd).subscribe({
      next: () => {
        this.exito.set(true);
        // Redirección retrasada para que el usuario lea el mensaje
        setTimeout(() => this.router.navigateByUrl('/login'), 1800);
      },
      error: (err) => {
        console.error(err);
        this.error.set('No se pudo cambiar la contraseña. Inténtalo más tarde.');
      }
    });
  }

  private passwordsIgualesValidator(group: any) {
    const p1 = group.get('newPassword')?.value;
    const p2 = group.get('confirmPassword')?.value;
    return p1 && p2 && p1 === p2 ? null : { noCoinciden: true };
  }

  // Helpers para el HTML
  get f() { return this.form.controls; }
}

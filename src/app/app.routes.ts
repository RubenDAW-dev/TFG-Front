import { Routes } from '@angular/router';
import { LoginComponent } from './features/login.component/login.component';
import { DashboardComponent } from './dashboard/dashboard';
import { Register } from './features/register/register';
import { ResetPassword } from './features/reset-password/reset-password';
import { ForgotPassword } from './features/forgot-password/forgot-password';
import { Jugadores } from './jugadores/jugadores/jugadores';
import { Equipos } from './equipos/equipos';
import { authGuard } from './core/Auth/auth.guard';
import { adminGuard } from './core/Auth/admin.guard';
import { Comparador } from './comparador/comparador';
import { Partidos } from './partidos/partidos';
import { PartidoDetalle } from './partidos/partido-detalle/partido-detalle';

export const routes: Routes = [
  // Públicas — sin guard
  { path: 'login', component: LoginComponent },
  { path: 'register', component: Register },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },
  { path: 'dashboard', component: DashboardComponent},
  
   // Protegidas — requieren login
  { path: 'jugadores', component: Jugadores, canActivate: [authGuard] },
  { path: 'equipos', component: Equipos, canActivate: [authGuard] },
  { path: 'comparador', component: Comparador, canActivate: [authGuard] },
  { path: 'partidos', component: Partidos, canActivate: [authGuard] },
  { path: 'partidos/:id', component: PartidoDetalle, canActivate: [authGuard] },

  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' }
];
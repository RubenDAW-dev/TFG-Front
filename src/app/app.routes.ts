import { Routes } from '@angular/router';
import { LoginComponent } from './features/login.component/login.component';
import { DashboardComponent } from './dashboard/dashboard';
import { Register } from './features/register/register';
import { ResetPassword } from './features/reset-password/reset-password';
import { ForgotPassword } from './features/forgot-password/forgot-password';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'register', component: Register },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },

  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' }
];
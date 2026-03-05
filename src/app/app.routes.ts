import { Routes } from '@angular/router';
import { LoginComponent } from './features/login.component/login.component';
import { DashboardComponent } from './dashboard/dashboard';
import { Register } from './features/register/register';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'register', component: Register },


  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' }
];
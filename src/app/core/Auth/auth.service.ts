import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  tokenType?: string;
  expiresIn?: number;
  user: { id: number; nombre: string; email: string; rol: number };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private storageTokenKey = 'auth_token';
  private storageUserKey  = 'auth_user';

  userSignal = signal<LoginResponse['user'] | null>(this.getStoredUser());

  private getStoredUser() {
    const raw = localStorage.getItem(this.storageUserKey);
    return raw ? JSON.parse(raw) as LoginResponse['user'] : null;
  }

  login(body: LoginRequest) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, body);
  }

  setSession(res: LoginResponse) {
    localStorage.setItem(this.storageTokenKey, res.token);
    localStorage.setItem(this.storageUserKey, JSON.stringify(res.user));
    this.userSignal.set(res.user);
  }

  logout() {
    localStorage.removeItem(this.storageTokenKey);
    localStorage.removeItem(this.storageUserKey);
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  get token(): string | null {
    return localStorage.getItem(this.storageTokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  isAdmin(): boolean {
    const u = this.userSignal();
    return !!u && u.rol === 1;
  }

  currentUser() {
    return this.userSignal();
  }

  register(body: LoginRequest) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/usuario/create`, body);
  }
}
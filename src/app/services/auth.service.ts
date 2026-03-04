import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl + '/matches';

  constructor(private http: HttpClient) {}

  login(payload: any) {
    return this.http.post(`${this.api}/login`, payload);
  }
  register(payload: any) {
    return this.http.post(`${this.api}/register`, payload);
  }
  recover(email: string) {
    return this.http.post(`${this.api}/recover`, { email });
  }
}
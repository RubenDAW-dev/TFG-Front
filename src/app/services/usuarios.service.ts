import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UsuarioDTO {
  id: number;
  nombre: string;
  email: string;
  rol: number; // 1 = admin, 0 = usuario normal
}

export interface CrearUsuarioDTO {
  nombre: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private api = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) { }

  listar(): Observable<any[]> {
  return this.http.get<any>(`${this.api}/list`).pipe(
    map(response => response.content || [])
  );
}

  obtener(id: number): Observable<UsuarioDTO> {
    return this.http.get<UsuarioDTO>(`${this.api}/${id}`);
  }

  crear(dto: CrearUsuarioDTO): Observable<unknown> {
    return this.http.post(`${this.api}/create`, dto);
  }

  actualizar(id: number, dto: Partial<UsuarioDTO>): Observable<UsuarioDTO> {
    return this.http.put<UsuarioDTO>(`${this.api}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  cambiarRol(id: number, nuevoRol: number): Observable<UsuarioDTO> {
    return this.http.put<UsuarioDTO>(`${this.api}/${id}/rol`, { rol: nuevoRol });
  }

  resetPassword(id: number, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.api}/${id}/reset-password/${newPassword}`, {});
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UsuarioDTO {
  id: number;
  nombre: string;
  email: string;
  rol: number; // 1 = admin, 0 = usuario normal
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private api = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) { }

  listar(): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(`${this.api}`);
  }

  obtener(id: number): Observable<UsuarioDTO> {
    return this.http.get<UsuarioDTO>(`${this.api}/${id}`);
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
}
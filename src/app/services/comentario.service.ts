import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { ComentarioResponseDTO, CrearComentarioDTO } from '../shared/models/comentario';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ComentarioService {

  private base = `${environment.apiUrl}/comentarios`;

  constructor(private http: HttpClient) {}

  
  crear(dto: CrearComentarioDTO): Observable<ComentarioResponseDTO> {
    return this.http.post<ComentarioResponseDTO>(`${this.base}/create`, dto);
  }

  actualizar(dto: any): Observable<ComentarioResponseDTO> {
    return this.http.put<ComentarioResponseDTO>(`${this.base}/update`, dto);
  }
 
  eliminar(id: number): Observable<string> {
    return this.http.delete(`${this.base}/delete/${id}`, { responseType: 'text' });
  }
 
  // ✅ PARA ADMIN: Obtener TODOS los comentarios (topics + respuestas)
  // Llamar al nuevo endpoint /admin/all
  todosLosComentarios(): Observable<ComentarioResponseDTO[]> {
    return this.http.get<ComentarioResponseDTO[]>(`${this.base}/admin/all`).pipe(
      map(res => Array.isArray(res) ? res : []),
      catchError(() => of([]))
    );
  }

  // ✅ PARA FRONTEND: Obtener solo topics raíz (sin respuestas)
  foroTopics(): Observable<ComentarioResponseDTO[]> {
    return this.http.get<ComentarioResponseDTO[]>(`${this.base}/foro`).pipe(
      map(res => Array.isArray(res) ? res : []),
      catchError(() => of([]))
    );
  }
 
  obtenerTopic(id: number): Observable<ComentarioResponseDTO> {
    return this.http.get<ComentarioResponseDTO>(`${this.base}/${id}`);
  }
 
  porPartido(matchId: number): Observable<ComentarioResponseDTO[]> {
    return this.http.get<ComentarioResponseDTO[]>(`${this.base}/partido/${matchId}`).pipe(
      map(res => Array.isArray(res) ? res : []),
      catchError(() => of([]))
    );
  }
 
  porEquipo(teamId: string): Observable<ComentarioResponseDTO[]> {
    return this.http.get<ComentarioResponseDTO[]>(`${this.base}/equipo/${teamId}`).pipe(
      map(res => Array.isArray(res) ? res : []),
      catchError(() => of([]))
    );
  }
 
  porJugador(playerId: string): Observable<ComentarioResponseDTO[]> {
    return this.http.get<ComentarioResponseDTO[]>(`${this.base}/jugador/${playerId}`).pipe(
      map(res => Array.isArray(res) ? res : []),
      catchError(() => of([]))
    );
  }
 
  respuestasDe(comentarioId: number): Observable<ComentarioResponseDTO[]> {
    return this.http.get<ComentarioResponseDTO[]>(`${this.base}/${comentarioId}/respuestas`).pipe(
      map(res => Array.isArray(res) ? res : []),
      catchError(() => of([]))
    );
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface SearchItemDTO {
  id: string;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  buscarEquipos(q: string): Observable<SearchItemDTO[]> {
    return this.http.get<SearchItemDTO[]>(`${this.api}/teams/search?q=${encodeURIComponent(q)}`).pipe(
      map(r => Array.isArray(r) ? r : []),
      catchError(() => of([]))
    );
  }

  buscarJugadores(q: string): Observable<SearchItemDTO[]> {
    return this.http.get<SearchItemDTO[]>(`${this.api}/players/search?q=${encodeURIComponent(q)}`).pipe(
      map(r => Array.isArray(r) ? r : []),
      catchError(() => of([]))
    );
  }

  buscarPartidos(q: string): Observable<SearchItemDTO[]> {
    return this.http.get<SearchItemDTO[]>(`${this.api}/matches/search?q=${encodeURIComponent(q)}`).pipe(
      map(r => Array.isArray(r) ? r : []),
      catchError(() => of([]))
    );
  }
}
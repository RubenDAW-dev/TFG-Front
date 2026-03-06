import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PlayerSeasonStatsService {

  private api = `${environment.apiUrl}/player-season-stats`;
  private teamsApi = `${environment.apiUrl}/teams`;

  constructor(private http: HttpClient) { }

  // === RANKINGS ===
  getTopScorers(teamId?: string, limit = 5) {
    if (teamId) {
      const q = new URLSearchParams();
      q.set('teamId', teamId);
      q.set('limit', String(limit));
      return this.http.get<any[]>(`${this.api}/team/top-scorers?${q.toString()}`);
    } else {
      return this.http.get<any[]>(`${this.api}/top-scorers?limit=${limit}`);
    }
  }

  getTopAssists(teamId?: string, limit = 5) {
    if (teamId) {
      const q = new URLSearchParams();
      q.set('teamId', teamId);
      q.set('limit', String(limit));
      return this.http.get<any[]>(`${this.api}/team/top-assists?${q.toString()}`);
    } else {
      return this.http.get<any[]>(`${this.api}/top-assists?limit=${limit}`);
    }
  }

  // === Tabla de plantilla (paginada) ===
  getTeamStatsPaged(teamId: string, page = 0, size = 20) {
    return this.http.get<any>(
      `${this.api}/team/${teamId}/players?page=${page}&size=${size}`
    );
  }
  getAll(page = 0, size = 20, sortField = 'goles', sortDir = 'desc') {
    return this.http.get<any>(
      `${this.api}/getAll?page=${page}&size=${size}&sortField=${sortField}&sortDir=${sortDir}`
    );
  }

  getPlayersByTeam(teamId: string, page = 0, size = 25) {
    return this.http.get<any>(
      `${this.api}/team/${teamId}/players?page=${page}&size=${size}`
    );
  }

  // ← CORREGIDO: apunta a /api/teams/getAll
  getTeams() {
    return this.http.get<any[]>(`${this.teamsApi}/getAll`);
  }
}
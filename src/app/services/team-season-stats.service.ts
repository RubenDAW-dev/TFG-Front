import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TeamSeasonStatsService {

  private api = `${environment.apiUrl}/team-season-stats`;

  constructor(private http: HttpClient) {}

  getLeagueTable() {
    return this.http.get<any[]>(`${this.api}/table`);
  }

  getStatsTable() {
    return this.http.get<any[]>(`${this.api}/stats-table`);
  }
  getById(id: string) {
    return this.http.get<any>(`${this.api}/get/${id}`);
  }
}
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TeamsService {

  private api = environment.apiUrl + '/teams';

  constructor(private http: HttpClient) {}

  getAllTeams() {
    return this.http.get<any[]>(`${this.api}`);
  }

  getTeam(id: string) {
    return this.http.get<any>(`${this.api}/${id}`);
  }

  getTeamStats(id: string) {
    return this.http.get<any>(`${this.api}/${id}/stats`);
  }

  getTeamPlayers(id: string) {
    return this.http.get<any[]>(`${this.api}/${id}/players`);
  }
}
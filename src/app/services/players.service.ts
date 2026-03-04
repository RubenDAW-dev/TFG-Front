import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PlayersService {

  private api = environment.apiUrl + '/players';

  constructor(private http: HttpClient) {}

  getAllPlayers() {
    return this.http.get<any[]>(`${this.api}`);
  }

  getPlayer(id: string) {
    return this.http.get<any>(`${this.api}/${id}`);
  }

  getPlayerSeasonStats(id: string) {
    return this.http.get<any>(`${this.api}/${id}/stats`);
  }

  getPlayersByTeam(teamId: string) {
    return this.http.get<any[]>(`${this.api}/team/${teamId}`);
  }
}
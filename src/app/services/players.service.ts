import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PlayersService {

  private api = environment.apiUrl + '/players';

  constructor(private http: HttpClient) { }

  getAllPlayers() {
    return this.http.get<any[]>(`${this.api}/getAll`);
  }

  getPlayer(id: string) {
    return this.http.get<any>(`${this.api}/get/${id}`);
  }

  getPlayerSeasonStats(id: string) {
    return this.http.get<any>(`${this.api}/${id}/stats`);
  }

  getPlayersByTeam(teamId: string) {
    return this.http.get<any[]>(`${this.api}/team/${teamId}`);
  }
  updatePlayer(id: string, payload: any) {
    return this.http.put<any>(`${this.api}/update/${id}`, payload);
  }
  createPlayer(payload: any){
    return this.http.put<any>(`${this.api}/create`, payload);
  }
}
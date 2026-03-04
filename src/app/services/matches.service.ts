import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MatchesService {

  private api = environment.apiUrl + '/matches';

  constructor(private http: HttpClient) {}

  getLastMatches() {
    return this.http.get<any[]>(`${this.api}/last`);
  }

  getUpcomingMatches() {
    return this.http.get<any[]>(`${this.api}/upcoming`);
  }

  getMatch(id: number) {
    return this.http.get<any>(`${this.api}/${id}`);
  }

  getMatchStats(id: number) {
    return this.http.get<any>(`${this.api}/${id}/stats`);
  }
}
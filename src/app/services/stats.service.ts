import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class StatsService {
  private api = environment.apiUrl + '/stats';

  constructor(private http: HttpClient) {}

  getTopScorers() {
    return this.http.get<any[]>(`${this.api}/top-scorers`);
  }
  getTopAssists() {
    return this.http.get<any[]>(`${this.api}/top-assists`);
  }
  getGlobalStats() {
    return this.http.get<any>(`${this.api}/global`);
  }
  getLeagueTable() {
    return this.http.get<any[]>(`${this.api}/table`);
  }
}
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { PastMatchDTO } from '../shared/models/past-match.dto';
import { Observable } from 'rxjs';
import { FutureMatchDTO } from '../shared/models/future-match.dto';

@Injectable({ providedIn: 'root' })
export class MatchesService {

  private api = environment.apiUrl + '/matches';

  constructor(private http: HttpClient) {}

  getUpcomingMatches() {
    return this.http.get<any[]>(`${this.api}/upcoming`);
  }

  getMatch(id: number) {
    return this.http.get<any>(`${this.api}/${id}`);
  }

  getMatchStats(id: number) {
    return this.http.get<any>(`${this.api}/${id}/stats`);
  }
  
  getLastMatches(): Observable<PastMatchDTO[]> {
    return this.http.get<PastMatchDTO[]>(`${this.api}/last`);
  }

  // Próximos partidos
  getNextMatches(): Observable<FutureMatchDTO[]> {
    return this.http.get<FutureMatchDTO[]>(`${this.api}/next`);
  }

}
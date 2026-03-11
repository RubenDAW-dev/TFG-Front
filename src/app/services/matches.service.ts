import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { PastMatchDTO } from '../shared/models/past-match.dto';
import { Observable } from 'rxjs';
import { FutureMatchDTO } from '../shared/models/future-match.dto';
import { MatchEntity } from '../shared/models/match.entity';

@Injectable({ providedIn: 'root' })
export class MatchesService {

  private api = environment.apiUrl + '/matches';

  constructor(private http: HttpClient) { }

  getMatch(id: number) {
    return this.http.get<any>(`${this.api}/${id}`);
  }

  getMatchStats(id: number) {
    return this.http.get<any>(`${this.api}/${id}/stats`);
  }

  getLastMatches(): Observable<PastMatchDTO[]> {
    return this.http.get<PastMatchDTO[]>(`${this.api}/last`);
  }
  getNextMatches(): Observable<FutureMatchDTO[]> {
    return this.http.get<FutureMatchDTO[]>(`${this.api}/next`);
  }

  getAll(): Observable<MatchEntity[]> {
    return this.http.get<MatchEntity[]>(`${this.api}/all`);
  }

  getById(id: number): Observable<MatchEntity> {
    return this.http.get<MatchEntity>(`${this.api}/get/${id}`);
  }

  getByWeek(wk: number): Observable<MatchEntity[]> {
    return this.http.get<MatchEntity[]>(`${this.api}/week/${wk}`);
  }
}
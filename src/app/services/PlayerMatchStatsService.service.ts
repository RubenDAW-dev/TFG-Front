// player-match-stats.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlayerMatchStatsEntity } from '../shared/models/player-match-stats.entity';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class PlayerMatchStatsService {
  private baseUrl = '/api/player-stats';
  constructor(private http: HttpClient) {}

  getByMatch(matchId: number): Observable<PlayerMatchStatsEntity[]> {
    return this.http.get<PlayerMatchStatsEntity[]>(`${environment.apiUrl}/player-stats/match/${matchId}`);
  }
}
// team-match-stats.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TeamMatchStatsEntity } from '../shared/models/team-match-stats.entity';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class TeamMatchStatsService {
  constructor(private http: HttpClient) {}

  getByMatch(matchId: string): Observable<TeamMatchStatsEntity[]> {
    return this.http.get<TeamMatchStatsEntity[]>(`${environment.apiUrl}/team-match-stats/match/${matchId}`);
  }
}
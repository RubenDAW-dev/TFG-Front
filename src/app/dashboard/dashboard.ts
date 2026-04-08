import { Component, OnInit, signal } from '@angular/core';
import { PlayerSeasonStatsService } from '../services/player-season-stats.service';
import { TeamSeasonStatsService } from '../services/team-season-stats.service';
import { MatchesService } from '../services/matches.service';
import { TopScorers } from './components/top-scorers/top-scorers';
import { TopAssits } from './components/top-assits/top-assits';
import { LeagueTableComponent } from './components/league-table/league-table';
import { CommonModule } from '@angular/common';
import { PastMatchDTO } from '../shared/models/past-match.dto';
import { FutureMatchDTO } from '../shared/models/future-match.dto';
import { PastMatches } from './components/past-matches/past-matches';
import { NextMatches } from './components/next-matches/next-matches';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports: [
    TopScorers,
    TopAssits,
    LeagueTableComponent,
    PastMatches,
    NextMatches,
    CommonModule,
    RouterModule
  ]
})
export class DashboardComponent implements OnInit {

  topScorers = signal<any[]>([]);
  topAssists = signal<any[]>([]);
  leagueTable = signal<any[]>([]);
  pastMatches = signal<PastMatchDTO[]>([]);
  nextMatches = signal<FutureMatchDTO[]>([]);

  constructor(
    private pss: PlayerSeasonStatsService,
    private teamStats: TeamSeasonStatsService,
    private matchService: MatchesService
  ) {}

  ngOnInit(): void {

    this.pss.getTopScorers(undefined, 5).subscribe(res => {
      this.topScorers.set(res ?? []);
    });

    this.pss.getTopAssists(undefined, 5).subscribe(res => {
      this.topAssists.set(res ?? []);
    });

    this.teamStats.getLeagueTable().subscribe(res => {
      this.leagueTable.set((res ?? []).reverse());
    });
    
    this.matchService.getLastMatches().subscribe(
      res => {
        this.pastMatches.set(res)
      }
    );
    this.matchService.getNextMatches().subscribe(
      res => {
        this.nextMatches.set(res)
      }
    );


  }
}
import { Component, OnInit } from '@angular/core';
import { StatsService } from '../services/stats/stats.service';
import { MatchesService } from '../services/matches/matches.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class Dashboard implements OnInit {

  topScorers: any[] = [];
  topAssists: any[] = [];
  radarStats: any = null;
  lastMatches: any[] = [];

  loading: boolean = true;

  constructor(
    private statsService: StatsService,
    private matchesService: MatchesService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;

    Promise.all([
      this.statsService.getTopScorers().toPromise(),
      this.statsService.getTopAssists().toPromise(),
      this.statsService.getGlobalStats().toPromise(),
      this.matchesService.getLastMatches().toPromise()
    ])
      .then(([scorers, assists, global, matches]) => {
        this.topScorers = scorers ?? [];
        this.topAssists = assists ?? [];
        this.radarStats = global ?? null;
        this.lastMatches = matches ?? [];
      })
      .finally(() => (this.loading = false));
  }
}
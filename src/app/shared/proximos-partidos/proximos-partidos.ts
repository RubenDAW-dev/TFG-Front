import { Component, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchesService } from '../../services/matches.service';
import { TeamFutureMatchDTO } from '../../shared/models/team-future-match.dto';
import { RouterLink } from '@angular/router';
import { TeamPastMatchDTO } from '../models/team-past-match.dto';

@Component({
  selector: 'app-proximos-partidos',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './proximos-partidos.html',
  styleUrl: './proximos-partidos.css'
})
export class ProximosPartidos implements OnChanges {
  @Input() teamId!: string;
  @Input() teamName?: string;
 
  futurematches: TeamFutureMatchDTO[] = [];

  loading = true;
  empty = false;
 
  constructor(
    private matchesService: MatchesService,
    private cdr: ChangeDetectorRef
  ) {}
 
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['teamId'] && this.teamId) {
      this.load();
    }
  }
 
  private load(): void {
    this.loading = true;
    this.empty = false;
 
    this.matchesService.getNextMatchesByTeam(this.teamId).subscribe({
      next: (data) => {
        this.futurematches = data ?? [];
        this.empty = this.futurematches.length === 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.futurematches = [];
        this.empty = true;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
 
  isHome(match: TeamFutureMatchDTO): boolean {
    return match.homeTeamId === this.teamId;
  }
 
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }
}
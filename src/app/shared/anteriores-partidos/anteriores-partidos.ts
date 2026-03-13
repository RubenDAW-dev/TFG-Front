import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TeamPastMatchDTO } from '../models/team-past-match.dto';
import { MatchesService } from '../../services/matches.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TeamFutureMatchDTO } from '../models/team-future-match.dto';

@Component({
  selector: 'app-anteriores-partidos',
  imports: [CommonModule, RouterLink],
  templateUrl: './anteriores-partidos.html',
  styleUrl: './anteriores-partidos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnterioresPartidos implements OnChanges{

  @Input() teamId!: string;
  @Input() teamName?: string;

  constructor(
    private matchesService: MatchesService,
    private cdr: ChangeDetectorRef
  ) { }

  loading = true;
  empty = false;
  pastmatches: TeamPastMatchDTO[] = [];


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['teamId'] && this.teamId) {
      this.load();
    }
  }

  private load(): void {
    this.loading = true;
    this.empty = false;
    this.matchesService.getLastMatchesByTeam(this.teamId).subscribe({
      next: (data) => {
        this.pastmatches = [...(this.pastmatches ?? []), ...(data ?? [])];
        this.empty = this.pastmatches.length === 0;
        this.loading = false;
        this.cdr.detectChanges();
        console.log('Partidos pasados:', this.pastmatches);
      },
      error: () => {
        this.empty = this.pastmatches.length === 0;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
  isHome(match: TeamPastMatchDTO): boolean {
    return match.homeTeamId === this.teamId;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }
}

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatchEntity } from '../shared/models/match.entity';
import { MatchesService } from '../services/matches.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-partidos',
  imports: [CommonModule],
  templateUrl: './partidos.html',
  styleUrl: './partidos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Partidos implements OnInit {
  
  allMatches: MatchEntity[] = [];
  currentRoundMatches: MatchEntity[] = [];
  playedMatches: MatchEntity[] = [];
  upcomingMatches: MatchEntity[] = [];

  currentRound: number = 0;
  selectedRound: number | null = null;
  availableRounds: number[] = [];

  activeTab: 'played' | 'upcoming' = 'played';
  loading = true;
  error: string | null = null;

  constructor(private matchService: MatchesService,private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadAllMatches();
  }

  loadAllMatches(): void {
    this.loading = true;
    this.matchService.getAll().subscribe({
      next: (matches) => {
        this.allMatches = matches;
        this.processMatches(matches);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar los partidos';
        this.loading = false;
      }
    });
  }

  processMatches(matches: MatchEntity[]): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Jornada actual = la jornada cuya fecha media es más cercana a hoy
    const roundDates = new Map<number, number>();
    matches.forEach(m => {
      if (!m.date) return;
      const d = new Date(m.date + 'T00:00:00').getTime();
      if (!roundDates.has(m.wk) || d < roundDates.get(m.wk)!) {
        roundDates.set(m.wk, d); // tomamos el primer partido de cada jornada
      }
    });

    const todayMs = today.getTime();
    let currentRound = 1;
    let minDiff = Infinity;

    roundDates.forEach((firstMatchMs, wk) => {
      const diff = Math.abs(firstMatchMs - todayMs);
      if (diff < minDiff) {
        minDiff = diff;
        currentRound = wk;
      }
    });

    this.currentRound = currentRound;
    this.currentRoundMatches = this.sortByDateTime(
      matches.filter(m => m.wk === currentRound)
    );

    // Jugados: partidos con resultado de jornadas anteriores a la actual
    const played = matches.filter(
      m => m.wk !== currentRound && m.score && m.score.trim() !== ''
    );

    // Próximos: partidos sin resultado de jornadas posteriores a la actual
    const upcoming = matches.filter(
      m => m.wk !== currentRound && (!m.score || m.score.trim() === '')
    );

    this.playedMatches   = this.sortByDateTime(played);
    this.upcomingMatches = this.sortByDateTime(upcoming);

    // Select de jornadas jugadas (de más reciente a más antigua)
    this.availableRounds = [...new Set(this.playedMatches.map(m => m.wk))].sort((a, b) => b - a);
    this.selectedRound = this.availableRounds[0] ?? null;
  }

  /** Ordena partidos por fecha y luego por hora ascendente */
  private sortByDateTime(matches: MatchEntity[]): MatchEntity[] {
    return [...matches].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
      const dateB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
      return dateA - dateB;
    });
  }

  /** Parsea el score "2–1" y devuelve [homeGoals, awayGoals] */
  parseScore(score: string | null): [number, number] | null {
    if (!score) return null;
    // El guion en los datos es un en-dash (–), también soportamos guion normal
    const parts = score.split(/[–\-]/);
    if (parts.length !== 2) return null;
    return [parseInt(parts[0].trim(), 10), parseInt(parts[1].trim(), 10)];
  }

  getResultClass(match: MatchEntity): string {
    const parsed = this.parseScore(match.score);
    if (!parsed) return '';
    const [home, away] = parsed;
    if (home > away) return 'home-win';
    if (home < away) return 'away-win';
    return 'draw';
  }

  getMatchesByRound(round: number): MatchEntity[] {
    return this.playedMatches.filter(m => m.wk === round);
  }

  getUpcomingByRound(round: number): MatchEntity[] {
    return this.upcomingMatches.filter(m => m.wk === round);
  }

  getUpcomingRounds(): number[] {
    return [...new Set(this.upcomingMatches.map(m => m.wk))].sort((a, b) => a - b);
  }

  selectRound(round: number): void {
    this.selectedRound = round;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00'); // evitar desfase UTC
    return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  }
}

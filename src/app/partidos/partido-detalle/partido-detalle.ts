import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PlayerMatchStatsEntity } from '../../shared/models/player-match-stats.entity';
import { MatchEntity } from '../../shared/models/match.entity';
import { TeamMatchStatsEntity } from '../../shared/models/team-match-stats.entity';
import { ActivatedRoute, Router } from '@angular/router';
import { MatchesService } from '../../services/matches.service';
import { TeamMatchStatsService } from '../../services/TeamMatchStatsService.service';
import { PlayerMatchStatsService } from '../../services/PlayerMatchStatsService.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface StatDef { key: string; label: string; }

@Component({
  selector: 'app-partido-detalle',
  imports: [CommonModule],
  templateUrl: './partido-detalle.html',
  styleUrl: './partido-detalle.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartidoDetalle implements OnInit {

  @ViewChild('radarCanvas')  radarCanvas!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('radarCanvas2') radarCanvas2!: ElementRef<HTMLCanvasElement>;

  match: MatchEntity | null = null;
  teamStats: TeamMatchStatsEntity[] = [];
  playerStats: PlayerMatchStatsEntity[] = [];

  homeStats: TeamMatchStatsEntity | null = null;
  awayStats: TeamMatchStatsEntity | null = null;

  homePlayers: PlayerMatchStatsEntity[] = [];
  awayPlayers: PlayerMatchStatsEntity[] = [];

  // Stats de temporada (para partidos no jugados)
  homeSeasonStats: any = null;
  awaySeasonStats: any = null;

  private chart:  Chart | null = null;
  private chart2: Chart | null = null;

  loading = true;
  error: string | null = null;

  // ── Definición de stats de temporada ──────────────────────
  readonly seasonStats: StatDef[] = [
    { key: 'puntos',                 label: 'Puntos'             },
    { key: 'victorias',              label: 'Victorias'          },
    { key: 'empates',                label: 'Empates'            },
    { key: 'derrotas',               label: 'Derrotas'           },
    { key: 'golesFavor',             label: 'Goles a favor'      },
    { key: 'golesContra',            label: 'Goles en contra'    },
    { key: 'diferenciaGoles',        label: 'Diferencia'         },
    { key: 'posesionMedia',          label: 'Posesión media'     },
    { key: 'tirosMedia',             label: 'Tiros / partido'    },
    { key: 'tirosPuertaMedia',       label: 'A puerta / partido' },
    { key: 'paradasMedia',           label: 'Paradas / partido'  },
    { key: 'golesPorPartido',        label: 'Goles / partido'    },
    { key: 'amarillasEquipo',        label: 'Amarillas'          },
    { key: 'rojasEquipo',            label: 'Rojas'              },
    { key: 'faltasCometidasEquipo',  label: 'Faltas cometidas'   },
    { key: 'precisionTiroMedia',     label: 'Precisión tiro %'   },
    { key: 'centrosEquipo',          label: 'Centros'            },
    { key: 'intercepcionesEquipo',   label: 'Intercepciones'     },
  ];

  // ── Definición de stats para radar ───────────────────────
  private readonly radarStats: StatDef[] = [
    { key: 'victorias',        label: 'Victorias'      },
    { key: 'golesFavor',       label: 'Goles favor'    },
    { key: 'posesionMedia',    label: 'Posesión'       },
    { key: 'tirosMedia',       label: 'Tiros'          },
    { key: 'paradasMedia',     label: 'Paradas'        },
    { key: 'precisionTiroMedia', label: 'Precisión %'  },
  ];

  private readonly radarStats2: StatDef[] = [
  { key: 'golesPorPartido',        label: 'Goles/PJ' },
  { key: 'golesContraPorPartido',  label: 'GC/PJ' },
  { key: 'posesionMedia',          label: 'Posesión' },
  { key: 'tirosMedia',             label: 'Tiros/PJ' },
  { key: 'tirosPuertaMedia',       label: 'T.Puerta/PJ' },
  { key: 'paradasMedia',           label: 'Paradas/PJ' },
  { key: 'tarjetasMedia',          label: 'Tarjetas/PJ' }
];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private matchService: MatchesService,
    private teamStatsService: TeamMatchStatsService,
    private playerStatsService: PlayerMatchStatsService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.error = 'ID de partido no encontrado'; this.loading = false; return; }

    this.matchService.getById(+id).subscribe({
      next: (match) => {
        this.match = match;
        this.cdr.markForCheck();
        if (match.score && match.score.trim() !== '') {
          this.loadStats(+id, match);
        } else {
          this.loadSeasonStats(match);
          this.loading = false;
          this.cdr.markForCheck();
        }
      },
      error: () => {
        this.error = 'No se pudo cargar el partido';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ── Stats del partido (jugado) ────────────────────────────
  loadStats(matchId: number, match: MatchEntity): void {

    this.teamStatsService.getByMatch(String(matchId)).subscribe({
      next: (stats) => {
        this.homeStats = stats.find(s => s.side.toLowerCase() === 'home') ?? null;
        this.awayStats = stats.find(s => s.side.toLowerCase() === 'away') ?? null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.homeStats = null;
        this.awayStats = null;
        this.cdr.markForCheck();
      }
    });

    this.playerStatsService.getByMatch(matchId).subscribe({
      next: (stats) => {
        if (!stats) {
          this.loading = false;
          this.cdr.markForCheck();
          return;
        }
        this.playerStats = stats;
        this.homePlayers = this.sortPlayers(
          stats.filter(s => s.player.team?.id === match.homeTeam.id)
        );
        this.awayPlayers = this.sortPlayers(
          stats.filter(s => s.player.team?.id === match.awayTeam.id)
        );
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.homePlayers = [];
        this.awayPlayers = [];
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ── Stats de temporada (no jugado) ───────────────────────
  loadSeasonStats(match: MatchEntity): void {
    this.http.get<any[]>(`${environment.apiUrl}/team-season-stats/stats-table`).subscribe({
      next: (data) => {
        this.homeSeasonStats = data.find(t => t.teamId === match.homeTeam.id) ?? null;
        this.awaySeasonStats = data.find(t => t.teamId === match.awayTeam.id) ?? null;
        this.cdr.markForCheck();
        // Renderizar radares tras el ciclo de detección
        if (this.homeSeasonStats && this.awaySeasonStats) {
          setTimeout(() => { this.renderRadar();  }, 0);
          setTimeout(() => { this.renderRadar2(); }, 0);
        }
      },
      error: () => {
        this.homeSeasonStats = null;
        this.awaySeasonStats = null;
        this.cdr.markForCheck();
      }
    });
  }

  // ── Radar ─────────────────────────────────────────────────
  private destroyChart(): void {
    if (this.chart)  { this.chart.destroy();  this.chart  = null; }
  }

  private destroyChart2(): void {
    if (this.chart2) { this.chart2.destroy(); this.chart2 = null; }
  }

  private buildRadarChart(
  canvas: HTMLCanvasElement,
  rawA: number[],
  rawB: number[],
  labels: string[]
): Chart {
  const combined = rawA.map((_, i) => Math.max(rawA[i], rawB[i], 1));
  const normA = rawA.map((v, i) => Math.round((v / combined[i]) * 100));
  const normB = rawB.map((v, i) => Math.round((v / combined[i]) * 100));

  const tooltipLabel = (context: any) => {
    const isA = context.datasetIndex === 0;
    const rawValue = isA
      ? rawA[context.dataIndex]
      : rawB[context.dataIndex];

    const formatted = Number.isInteger(rawValue)
      ? String(rawValue)
      : rawValue.toFixed(1);

    return formatted;
  };

  return new Chart(canvas.getContext('2d')!, {
    type: 'radar',
    data: {
      labels,
      datasets: [
        {
          label: 'home',
          data: normA,
          backgroundColor: 'rgba(0, 212, 255, 0.15)',
          borderColor: '#00d4ff',
          borderWidth: 2,
          pointBackgroundColor: '#00d4ff',

          // 🔥 NECESARIO PARA QUE SE VEA EL TOOLTIP
          pointRadius: 5,
          pointHoverRadius: 8,
          pointHitRadius: 20,
        },
        {
          label: 'away',
          data: normB,
          backgroundColor: 'rgba(255, 80, 120, 0.15)',
          borderColor: '#ff5078',
          borderWidth: 2,
          pointBackgroundColor: '#ff5078',

          // 🔥 NECESARIO PARA QUE SE VEA EL TOOLTIP
          pointRadius: 5,
          pointHoverRadius: 8,
          pointHitRadius: 20,
        }
      ]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: { label: tooltipLabel },
          backgroundColor: 'rgba(13, 21, 32, 0.95)',
          bodyFont: {
            family: "'Barlow Condensed', sans-serif",
            size: 18
          }
        }
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { display: false },
          grid: { color: 'rgba(255,255,255,0.08)' },
          pointLabels: {
            color: '#e8edf5',
            font: {
              size: 16,
              family: "'Barlow Condensed', sans-serif"
            }
          }
        }
      }
    }
  });
}


  private renderRadar(): void {
    if (!this.radarCanvas || !this.homeSeasonStats || !this.awaySeasonStats) return;
    this.destroyChart();
    const keys   = this.radarStats.map(s => s.key);
    const labels = this.radarStats.map(s => s.label);
    const rawA = keys.map(k => Number(this.homeSeasonStats[k]) || 0);
    const rawB = keys.map(k => Number(this.awaySeasonStats[k]) || 0);
    this.chart = this.buildRadarChart(
      this.radarCanvas.nativeElement, rawA, rawB, labels
    );
  }

  private renderRadar2(): void {
    if (!this.radarCanvas2 || !this.homeSeasonStats || !this.awaySeasonStats) return;
    this.destroyChart2();
    const keys   = this.radarStats2.map(s => s.key);
    const labels = this.radarStats2.map(s => s.label);
    const rawA = keys.map(k => Number(this.homeSeasonStats[k]) || 0);
    const rawB = keys.map(k => Number(this.awaySeasonStats[k]) || 0);
    this.chart2 = this.buildRadarChart(
      this.radarCanvas2.nativeElement, rawA, rawB, labels
    );
  }

  // ── Helpers ───────────────────────────────────────────────
  sortPlayers(players: PlayerMatchStatsEntity[]): PlayerMatchStatsEntity[] {
    return [...players].sort((a, b) => (a.number ?? 99) - (b.number ?? 99));
  }

  isPlayed(): boolean {
    return !!this.match?.score && this.match.score.trim() !== '';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  homePossessionWidth(): number {
    return this.homeStats?.possession ?? 50;
  }

  formatVal(v: any): string {
    if (v == null) return '—';
    if (typeof v === 'number') return Number.isInteger(v) ? String(v) : v.toFixed(1);
    return String(v);
  }

  getPct(valA: any, valB: any): number {
    const max = Math.max(Number(valA) || 0, Number(valB) || 0);
    if (!max) return 0;
    return Math.round(((Number(valA) || 0) / max) * 100);
  }

  ganador(valA: any, valB: any): 'home' | 'away' | null {
    const a = Number(valA) || 0;
    const b = Number(valB) || 0;
    if (a === b) return null;
    return a > b ? 'home' : 'away';
  }

  goBack(): void {
    this.router.navigate(['/partidos']);
  }
}
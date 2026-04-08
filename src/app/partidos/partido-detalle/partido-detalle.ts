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
  @ViewChild('goalsChart')     goalsChart!:     ElementRef<HTMLCanvasElement>;
  @ViewChild('shotsChart')     shotsChart!:     ElementRef<HTMLCanvasElement>;
  @ViewChild('assistsChart')   assistsChart!:   ElementRef<HTMLCanvasElement>;
  @ViewChild('interceptionsChart') interceptionsChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cardsChart')     cardsChart!:     ElementRef<HTMLCanvasElement>;
  @ViewChild('tacklesChart')  tacklesChart!:  ElementRef<HTMLCanvasElement>;

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
  private goalsChartInstance: Chart | null = null;
  private shotsChartInstance: Chart | null = null;
  private assistsChartInstance: Chart | null = null;
  private interceptionsChartInstance: Chart | null = null;
  private cardsChartInstance: Chart | null = null;
  private tacklesChartInstance: Chart | null = null;

  // Colores consistentes para equipos
  private readonly homeColor = 'rgba(59, 130, 246, 0.8)'; // Azul
  private readonly awayColor = 'rgba(239, 68, 68, 0.8)'; // Rojo
  private readonly homeBorderColor = 'rgba(59, 130, 246, 1)';
  private readonly awayBorderColor = 'rgba(239, 68, 68, 1)';

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

  ngOnDestroy(): void {
    this.destroyChart();
    this.destroyChart2();
    this.destroyPlayerCharts();
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
        // Renderizar gráficos de jugadores
        this.renderPlayerCharts();
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
  const normA = rawA.map((v, i) => (v / combined[i]) * 100);
  const normB = rawB.map((v, i) => (v / combined[i]) * 100);

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

  // ── Gráficos de jugadores (partidos jugados) ──────────────
  private destroyPlayerCharts(): void {
    if (this.goalsChartInstance)   { this.goalsChartInstance.destroy();   this.goalsChartInstance   = null; }
    if (this.shotsChartInstance)   { this.shotsChartInstance.destroy();   this.shotsChartInstance   = null; }
    if (this.assistsChartInstance) { this.assistsChartInstance.destroy(); this.assistsChartInstance = null; }
    if (this.interceptionsChartInstance) { this.interceptionsChartInstance.destroy(); this.interceptionsChartInstance = null; }
    if (this.cardsChartInstance)   { this.cardsChartInstance.destroy();   this.cardsChartInstance   = null; }
    if (this.tacklesChartInstance) { this.tacklesChartInstance.destroy(); this.tacklesChartInstance = null; }
  }

  private renderPlayerCharts(): void {
    if (!this.isPlayed() || (!this.homePlayers.length && !this.awayPlayers.length)) return;

    setTimeout(() => {
      this.destroyPlayerCharts();
      this.renderGoalsChart();
      this.renderShotsChart();
      this.renderAssistsChart();
      this.renderInterceptionsChart();
      this.renderCardsChart();
      this.renderTacklesChart();
    }, 100);
  }

  private renderGoalsChart(): void {
    if (!this.goalsChart) return;

    const homeGoals = this.homePlayers
      .filter(p => (p.gls ?? 0) > 0)
      .map(p => ({ name: p.player.nombre, value: p.gls ?? 0, team: 'home' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const awayGoals = this.awayPlayers
      .filter(p => (p.gls ?? 0) > 0)
      .map(p => ({ name: p.player.nombre, value: p.gls ?? 0, team: 'away' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const allGoals = [...homeGoals, ...awayGoals].sort((a, b) => b.value - a.value).slice(0, 10);

    this.goalsChartInstance = new Chart(this.goalsChart.nativeElement, {
      type: 'bar',
      data: {
        labels: allGoals.map(p => p.name),
        datasets: [{
          label: 'Goles',
          data: allGoals.map(p => p.value),
          backgroundColor: allGoals.map(p => p.team === 'home' ? this.homeColor : this.awayColor),
          borderColor: allGoals.map(p => p.team === 'home' ? this.homeBorderColor : this.awayBorderColor),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Goleadores del partido',
            font: { size: 16, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 }
          }
        }
      }
    });
  }

  private renderShotsChart(): void {
    if (!this.shotsChart) return;

    const homeShots = this.homePlayers
      .filter(p => (p.shots ?? 0) > 0)
      .map(p => ({ name: p.player.nombre, value: p.shots ?? 0, team: 'home' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const awayShots = this.awayPlayers
      .filter(p => (p.shots ?? 0) > 0)
      .map(p => ({ name: p.player.nombre, value: p.shots ?? 0, team: 'away' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const allShots = [...homeShots, ...awayShots].sort((a, b) => b.value - a.value).slice(0, 10);

    this.shotsChartInstance = new Chart(this.shotsChart.nativeElement, {
      type: 'bar',
      data: {
        labels: allShots.map(p => p.name),
        datasets: [{
          label: 'Tiros',
          data: allShots.map(p => p.value),
          backgroundColor: allShots.map(p => p.team === 'home' ? this.homeColor : this.awayColor),
          borderColor: allShots.map(p => p.team === 'home' ? this.homeBorderColor : this.awayBorderColor),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Tiros',
            font: { size: 16, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 }
          }
        }
      }
    });
  }

  private renderAssistsChart(): void {
    if (!this.assistsChart) return;

    const homeAssists = this.homePlayers
      .filter(p => (p.ast ?? 0) > 0)
      .map(p => ({ name: p.player.nombre, value: p.ast ?? 0, team: 'home' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const awayAssists = this.awayPlayers
      .filter(p => (p.ast ?? 0) > 0)
      .map(p => ({ name: p.player.nombre, value: p.ast ?? 0, team: 'away' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const allAssists = [...homeAssists, ...awayAssists].sort((a, b) => b.value - a.value).slice(0, 10);

    this.assistsChartInstance = new Chart(this.assistsChart.nativeElement, {
      type: 'bar',
      data: {
        labels: allAssists.map(p => p.name),
        datasets: [{
          label: 'Asistencias',
          data: allAssists.map(p => p.value),
          backgroundColor: allAssists.map(p => p.team === 'home' ? this.homeColor : this.awayColor),
          borderColor: allAssists.map(p => p.team === 'home' ? this.homeBorderColor : this.awayBorderColor),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Asistencias',
            font: { size: 16, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 }
          }
        }
      }
    });
  }

  private renderInterceptionsChart(): void {
    if (!this.interceptionsChart) return;

    const homeInterceptions = this.homePlayers
      .filter(p => (p.interceptions ?? 0) > 0)
      .map(p => ({ name: p.player.nombre, value: p.interceptions ?? 0, team: 'home' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const awayInterceptions = this.awayPlayers
      .filter(p => (p.interceptions ?? 0) > 0)
      .map(p => ({ name: p.player.nombre, value: p.interceptions ?? 0, team: 'away' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const allInterceptions = [...homeInterceptions, ...awayInterceptions].sort((a, b) => b.value - a.value).slice(0, 10);

    this.interceptionsChartInstance = new Chart(this.interceptionsChart.nativeElement, {
      type: 'bar',
      data: {
        labels: allInterceptions.map(p => p.name),
        datasets: [{
          label: 'Intercepciones',
          data: allInterceptions.map(p => p.value),
          backgroundColor: allInterceptions.map(p => p.team === 'home' ? this.homeColor : this.awayColor),
          borderColor: allInterceptions.map(p => p.team === 'home' ? this.homeBorderColor : this.awayBorderColor),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Intercepciones',
            font: { size: 16, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 }
          }
        }
      }
    });
  }

  private renderCardsChart(): void {
    if (!this.cardsChart) return;

    const cardPlayers = [...this.homePlayers, ...this.awayPlayers]
      .filter(p => ((p.yellowCards ?? 0) + (p.redCards ?? 0)) > 0)
      .map(p => ({
        name: p.player.nombre,
        yellow: p.yellowCards ?? 0,
        red: p.redCards ?? 0,
        total: (p.yellowCards ?? 0) + (p.redCards ?? 0)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const labels = cardPlayers.map(p => p.name);
    const yellowData = cardPlayers.map(p => p.yellow);
    const redData = cardPlayers.map(p => p.red);

    this.cardsChartInstance = new Chart(this.cardsChart.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Amarillas',
            data: yellowData,
            backgroundColor: 'rgba(245, 158, 11, 0.85)',
            borderColor: 'rgba(217, 119, 6, 1)',
            borderWidth: 1
          },
          {
            label: 'Rojas',
            data: redData,
            backgroundColor: 'rgba(239, 68, 68, 0.85)',
            borderColor: 'rgba(185, 28, 28, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
          title: {
            display: true,
            text: 'Tarjetas por jugador',
            font: { size: 16, weight: 'bold' }
          }
        },
        scales: {
          x: { stacked: false },
          y: {
            beginAtZero: true,
            ticks: { precision: 0 }
          }
        }
      }
    });
  }

  private renderTacklesChart(): void {
    if (!this.tacklesChart) return;

    const homeTackles = this.homePlayers
      .filter(p => (p.tacklesWon ?? 0) > 0)
      .map(p => ({ name: p.player.nombre, value: p.tacklesWon ?? 0, team: 'home' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const awayTackles = this.awayPlayers
      .filter(p => (p.tacklesWon ?? 0) > 0)
      .map(p => ({ name: p.player.nombre, value: p.tacklesWon ?? 0, team: 'away' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const allTackles = [...homeTackles, ...awayTackles].sort((a, b) => b.value - a.value).slice(0, 10);

    this.tacklesChartInstance = new Chart(this.tacklesChart.nativeElement, {
      type: 'bar',
      data: {
        labels: allTackles.map(p => p.name),
        datasets: [{
          label: 'Duelos ganados',
          data: allTackles.map(p => p.value),
          backgroundColor: allTackles.map(p => p.team === 'home' ? this.homeColor : this.awayColor),
          borderColor: allTackles.map(p => p.team === 'home' ? this.homeBorderColor : this.awayBorderColor),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Duelos ganados',
            font: { size: 16, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 }
          }
        }
      }
    });
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
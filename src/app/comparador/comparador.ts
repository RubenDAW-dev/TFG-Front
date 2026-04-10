// comparador.component.ts
import {
  Component, OnInit, AfterViewChecked,
  ViewChild, ElementRef, ChangeDetectorRef, inject
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { TeamSeasonStatsService } from '../services/team-season-stats.service';
import { PlayerSeasonStatsService } from '../services/player-season-stats.service';

Chart.register(...registerables);

interface OpcionItem { id: string; nombre: string; }

interface StatDef { key: string; label: string; }

@Component({
  selector: 'app-comparador',
  templateUrl: './comparador.html',
  styleUrls: ['./comparador.css'],
  imports: [CommonModule, FormsModule, NgSelectModule]
})
export class Comparador implements OnInit, AfterViewChecked {

  @ViewChild('radarCanvas') radarCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('radarCanvas2') radarCanvas2!: ElementRef<HTMLCanvasElement>;

  modo: 'equipos' | 'jugadores' = 'equipos';

  listaOpciones: OpcionItem[] = [];
  seleccionA: string | null = null;
  seleccionB: string | null = null;

  datosA: any = null;
  datosB: any = null;

  private chart: Chart | null = null;
  private chart2: Chart | null = null;
  private chartNeedsRender = false;
  private chart2NeedsRender = false;
  private cdr = inject(ChangeDetectorRef);

  // ---- Stats a mostrar según modo ----
  statsEquipos: StatDef[] = [
    { key: 'victorias', label: 'Victorias' },
    { key: 'empates', label: 'Empates' },
    { key: 'derrotas', label: 'Derrotas' },
    { key: 'puntos', label: 'Puntos' },
    { key: 'golesFavor', label: 'Goles a favor' },
    { key: 'golesContra', label: 'Goles en contra' },
    { key: 'diferenciaGoles', label: 'Diferencia goles' },
    { key: 'posesionMedia', label: 'Posesión media' },
    { key: 'tirosMedia', label: 'Tiros / partido' },
    { key: 'tirosPuertaMedia', label: 'Tiros a puerta' },
    { key: 'paradasMedia', label: 'Paradas / partido' },
    { key: 'golesPorPartido', label: 'Goles / partido' },
    { key: 'golesContraPorPartido', label: 'Goles contra / p.' },
    { key: 'amarillasEquipo', label: 'Amarillas' },
    { key: 'rojasEquipo', label: 'Rojas' },
    { key: 'faltasCometidasEquipo', label: 'Faltas cometidas' },
    { key: 'precisionTiroMedia', label: 'Precisión tiro %' },
    { key: 'conversionPenaltiMedia', label: 'Conv. penalti %' },
    { key: 'centrosEquipo', label: 'Centros' },
    { key: 'entradasGanadasEquipo', label: 'Entradas ganadas' },
    { key: 'intercepcionesEquipo', label: 'Intercepciones' },
  ];

  statsJugadores: StatDef[] = [
    { key: 'goles', label: 'Goles' },
    { key: 'asistencias', label: 'Asistencias' },
    { key: 'partidos', label: 'Partidos' },
    { key: 'minutos', label: 'Minutos' },
    { key: 'disparos', label: 'Disparos' },
    { key: 'disparosPuerta', label: 'Disparos puerta' },
    { key: 'amarillas', label: 'Amarillas' },
    { key: 'rojas', label: 'Rojas' },
    { key: 'faltasCometidas', label: 'Faltas cometidas' },
    { key: 'faltasRecibidas', label: 'Faltas recibidas' },
    { key: 'penaltisMarcados', label: 'Penaltis marcados' },
    { key: 'centros', label: 'Centros' },
    { key: 'entradasGanadas', label: 'Entradas ganadas' },
    { key: 'intercepciones', label: 'Intercepciones' },
    { key: 'fueraDeJuego', label: 'Fuera de juego' },
    { key: 'autogoles', label: 'Autogoles' },
    { key: 'golesPor90', label: 'Goles / 90' },
    { key: 'asistenciasPor90', label: 'Asist. / 90' },
    { key: 'disparosPor90', label: 'Disparos / 90' },
    { key: 'precisionTiro', label: 'Precisión tiro %' },
    { key: 'conversionPenalti', label: 'Conv. penalti %' },
  ];

  get statsComunes(): StatDef[] {
    return this.modo === 'equipos' ? this.statsEquipos : this.statsJugadores;
  }

  // ---- Keys segundo radar ----
  radarDetalleEquipos: StatDef[] = [
    { key: 'disparosEquipo', label: 'Disparos' },
    { key: 'disparosPuertaEquipo', label: 'Disparos puerta' },
    { key: 'faltasCometidasEquipo', label: 'Faltas cometidas' },
    { key: 'centrosEquipo', label: 'Centros' },
    { key: 'entradasGanadasEquipo', label: 'Entradas ganadas' },
    { key: 'intercepcionesEquipo', label: 'Intercepciones' },
    { key: 'precisionTiroMedia', label: 'Precisión tiro %' },
    { key: 'conversionPenaltiMedia', label: 'Conv. penalti %' },
  ];

  radarDetalleJugadores: StatDef[] = [
    { key: 'disparos', label: 'Disparos' },
    { key: 'disparosPuerta', label: 'Disparos puerta' },
    { key: 'faltasCometidas', label: 'Faltas cometidas' },
    { key: 'faltasRecibidas', label: 'Faltas recibidas' },
    { key: 'centros', label: 'Centros' },
    { key: 'entradasGanadas', label: 'Entradas ganadas' },
    { key: 'intercepciones', label: 'Intercepciones' },
    { key: 'penaltisMarcados', label: 'Penaltis marcados' },
  ];

  get radarDetalle(): StatDef[] {
    return this.modo === 'equipos' ? this.radarDetalleEquipos : this.radarDetalleJugadores;
  }

  constructor(
    private teamSeasonStatsService: TeamSeasonStatsService,
    private playerSeasonStatsService: PlayerSeasonStatsService
  ) { }

  ngOnInit(): void {
    this.cargarLista();
  }

  ngAfterViewChecked(): void { }

  setModo(m: 'equipos' | 'jugadores'): void {
    this.modo = m;
    this.seleccionA = null;
    this.seleccionB = null;
    this.datosA = null;
    this.datosB = null;
    this.listaOpciones = [];
    this.destroyChart();
    this.destroyChart2();
    this.cdr.detectChanges();
    this.cargarLista();
  }

  private cacheEquipos: any[] = [];

  private cargarLista(): void {
    if (this.modo === 'equipos') {
      this.teamSeasonStatsService.getStatsTable().subscribe({
        next: data => {
          this.cacheEquipos = data;
          this.listaOpciones = data.map(t => ({ id: t.teamId, nombre: t.teamName }));
          this.cdr.detectChanges();
        }
      });
    } else {
      this.cacheEquipos = [];
      this.playerSeasonStatsService.getAll().subscribe({
        next: data => {
          this.listaOpciones = data.map(p => ({ id: p.playerId, nombre: p.playerName }));
          this.cdr.detectChanges();
        }
      });
    }
  }

  onCambioA(): void { this.cargarDatos('A'); }
  onCambioB(): void { this.cargarDatos('B'); }

  private cargarDatos(lado: 'A' | 'B'): void {
    const id = lado === 'A' ? this.seleccionA : this.seleccionB;
    if (!id) return;

    if (this.modo === 'equipos') {
      const datos = this.cacheEquipos.find(t => t.teamId === id);
      if (datos) {
        if (lado === 'A') this.datosA = datos;
        else this.datosB = datos;
        this.cdr.detectChanges();
        if (this.datosA && this.datosB) {
          setTimeout(() => { this.destroyChart(); this.renderRadar(); }, 0);
          setTimeout(() => { this.destroyChart2(); this.renderRadar2(); }, 0);
        }
        this.cdr.detectChanges();
      }
    } else {
      this.playerSeasonStatsService.getById(id).subscribe({
        next: data => {
          const datos = Array.isArray(data) ? data[0] : data;
          if (lado === 'A') this.datosA = datos;
          else this.datosB = datos;
          this.cdr.detectChanges();
          if (this.datosA && this.datosB) {
            setTimeout(() => { this.destroyChart(); this.renderRadar(); }, 0);
            setTimeout(() => { this.destroyChart2(); this.renderRadar2(); }, 0);
          }
          this.cdr.detectChanges();
        }
      });
    }
  }

  // ---- Helpers ----
  getNombre(id: string | null): string {
    if (!id) return '';
    return this.listaOpciones.find(o => o.id === id)?.nombre ?? id;
  }

  formatVal(v: any): string {
    if (v == null) return '—';
    if (typeof v === 'number') return Number.isInteger(v) ? String(v) : v.toFixed(1);
    return String(v);
  }

  getPct(valPropio: number, valRival: number): number {
    const max = Math.max(Number(valPropio) || 0, Number(valRival) || 0);
    if (!max) return 0;
    return Math.round(((Number(valPropio) || 0) / max) * 100);
  }

  ganador(key: string): 'A' | 'B' | null {
    const a = Number(this.datosA?.[key]) || 0;
    const b = Number(this.datosB?.[key]) || 0;
    if (a === b) return null;
    return a > b ? 'A' : 'B';
  }

  // ---- Radar ----
  private normalize(vals: number[]): number[] {
    const max = Math.max(...vals, 1);
    return vals.map(v => Math.round((v / max) * 100));
  }

  private destroyChart(): void {
    if (this.chart) { this.chart.destroy(); this.chart = null; }
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
    const raw = context.datasetIndex === 0 ? rawA[context.dataIndex] : rawB[context.dataIndex];
    const nombre = context.datasetIndex === 0
      ? this.getNombre(this.seleccionA)
      : this.getNombre(this.seleccionB);
    const formatted = Number.isInteger(raw) ? String(raw) : raw.toFixed(1);
    return ` ${nombre}: ${formatted}`;
  };

  return new Chart(canvas.getContext('2d')!, {
    type: 'radar',
    data: {
      labels,
      datasets: [
        {
          label: this.getNombre(this.seleccionA),
          data: normA,
          backgroundColor: 'rgba(239, 68, 68, 0.25)',      // Rojo transparente
          borderColor: '#ef4444',                          // Rojo sólido
          borderWidth: 2,
          pointBackgroundColor: '#ef4444',                 // Puntos rojos
          pointBorderColor: '#fff',
          pointBorderWidth: 1,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: this.getNombre(this.seleccionB),
          data: normB,
          backgroundColor: 'rgba(59, 130, 246, 0.25)',     // Azul transparente
          borderColor: '#3b82f6',                          // Azul sólido
          borderWidth: 2,
          pointBackgroundColor: '#3b82f6',                 // Puntos azules
          pointBorderColor: '#fff',
          pointBorderWidth: 1,
          pointRadius: 4,
          pointHoverRadius: 6,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: tooltipLabel },
          backgroundColor: 'rgba(255, 244, 237, 0.95)',
          borderColor: 'rgba(185, 28, 28, 0.16)',
          borderWidth: 1,
          titleColor: '#351a11',
          bodyColor: '#351a11',
          titleFont: { family: "'Barlow Condensed', sans-serif", size: 11 },
          bodyFont: { family: "'Barlow Condensed', sans-serif", size: 13 },
          padding: 10,
        }
      },
      scales: {
        r: {
          min: 0, max: 100,
          ticks: { display: false },
          grid: { color: 'rgba(255,255,255,0.08)' },
          angleLines: { color: 'rgba(185, 28, 28, 0.18)' },
          pointLabels: {
            color: '#351a11',
            font: { size: 11, family: "'Barlow Condensed', sans-serif" }
          }
        }
      }
    }
  });
}

  private renderRadar(): void {
    this.destroyChart();
    const keys = this.statsComunes.slice(0, 6).map(s => s.key);
    const labels = this.statsComunes.slice(0, 6).map(s => s.label);
    const rawA = keys.map(k => Number(this.datosA?.[k]) || 0);
    const rawB = keys.map(k => Number(this.datosB?.[k]) || 0);
    this.chart = this.buildRadarChart(this.radarCanvas.nativeElement, rawA, rawB, labels);
  }

  private renderRadar2(): void {
    this.destroyChart2();
    const keys = this.radarDetalle.map(s => s.key);
    const labels = this.radarDetalle.map(s => s.label);
    const rawA = keys.map(k => Number(this.datosA?.[k]) || 0);
    const rawB = keys.map(k => Number(this.datosB?.[k]) || 0);
    this.chart2 = this.buildRadarChart(this.radarCanvas2.nativeElement, rawA, rawB, labels);
  }
}
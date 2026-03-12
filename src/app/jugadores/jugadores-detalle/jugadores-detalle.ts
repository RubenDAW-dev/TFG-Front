import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { PlayersService } from '../../services/players.service';
import { PlayerSeasonStatsService } from '../../services/player-season-stats.service';
import { ProximosPartidos } from "../../shared/proximos-partidos/proximos-partidos";

@Component({
  selector: 'app-player-detail',
  standalone: true,
  imports: [CommonModule, DecimalPipe, ProximosPartidos],
  templateUrl: './jugadores-detalle.html',
  styleUrl: './jugadores-detalle.css'
})
export class PlayerDetailComponent implements OnInit {
  player: any = null;
  stats: any = null;
  loading = true;
  error: string | null = null;
  readonly Math = Math;
 
  activeTab: 'ataque' | 'defensa' | 'disciplina' | 'por90' = 'ataque';
 
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private playersService: PlayersService,
    private statsService: PlayerSeasonStatsService,
    private cdr: ChangeDetectorRef
  ) { }
 
  ngOnInit(): void {
    // Usamos paramMap observable en lugar de snapshot
    // para capturar el id correctamente tras la navegación
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) return of({ player: null, stats: null, id: null });
 
        return forkJoin({
          player: this.playersService.getPlayer(id).pipe(catchError(() => of(null))),
          stats:  this.statsService.getById(id).pipe(catchError(() => of(null)))
        });
      })
    ).subscribe({
      next: ({ player, stats }) => {
        if (!player) {
          this.error = 'Jugador no encontrado.';
        } else {
          this.player = player;
          if (Array.isArray(stats)) {
            this.stats = stats[0] ?? null;
          } else {
            this.stats = stats ?? null;
          }
        }
        this.loading = false;
        // Forzar detección de cambios por si Angular no la dispara tras navegación
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error inesperado al cargar los datos.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
 
  setTab(tab: 'ataque' | 'defensa' | 'disciplina' | 'por90'): void {
    this.activeTab = tab;
  }
 
  goBack(): void {
    this.router.navigate(['/jugadores']);
  }
 
  getPositionLabel(position: string): string {
    const map: Record<string, string> = {
      'GK': 'Portero',       'CB': 'Defensa Central',
      'LB': 'Lateral Izq.',  'RB': 'Lateral Der.',
      'CDM': 'MC Defensivo', 'CM': 'Mediocentro',
      'CAM': 'Mediapunta',   'LW': 'Extremo Izq.',
      'RW': 'Extremo Der.',  'CF': 'Delantero Centro',
      'ST': 'Delantero',     'FW': 'Delantero',
      'MF': 'Centrocampista','DF': 'Defensa',
      'FW,MF': 'Del./Cent.', 'MF,DF': 'Cent./Def.',
      'FW,DF': 'Del./Def.',  'DF,MF': 'Def./Cent.',
      'MF,FW': 'Cent./Del.', 'DF,FW': 'Def./Del.'
    };
    const trimmed = position?.trim() ?? '';
    return map[trimmed] ?? map[trimmed.split(',')[0].trim()] ?? trimmed.split(',')[0].trim();
  }
 
  has(val: any): boolean {
    return val !== null && val !== undefined;
  }
}
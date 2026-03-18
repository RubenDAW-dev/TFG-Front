// src/app/equipos/equipos-detalle/equipos-detalle.ts
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { of, forkJoin } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

// Servicios
import { TeamsService } from '../../services/teams.service';
import { TeamSeasonStatsService } from '../../services/team-season-stats.service';

// Si quieres reusar el widget de próximos partidos como en jugadores:
import { ProximosPartidos } from '../../shared/proximos-partidos/proximos-partidos';
import { AnterioresPartidos } from '../../shared/anteriores-partidos/anteriores-partidos';

@Component({
  selector: 'app-equipos-detalle',
  standalone: true,
  imports: [CommonModule, DecimalPipe, ProximosPartidos, AnterioresPartidos],
  templateUrl: './equipos-detalle.html',
  styleUrl: './equipos-detalle.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EquiposDetalle implements OnInit {

  team: any = null;     // { id, nombre, estadio, ciudad, capacidad }
  stats: any = null;    // TeamStatsRowDTO (o null si no hay)
  loading = true;
  error: string | null = null;

  // Tabs: las mismas 4 que usas en el listado
  activeTab: 'ataque' | 'defensa' | 'disciplina' | 'medias' = 'ataque';
  readonly Math = Math;

  constructor(
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private teamsService: TeamsService,
    private statsService: TeamSeasonStatsService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (!id) return of({ team: null, stats: null });

          return forkJoin({
            team: this.teamsService.getTeam(id).pipe(catchError(() => of(null))),
            stats: this.statsService.getById(id).pipe(catchError(() => of(null))),
          });
        })
      )
      .subscribe({
        next: ({ team, stats }) => {
          if (!team) {
            this.error = 'Equipo no encontrado.';
          } else {
            this.team = team;
            // Normalizamos: si llega array, cogemos el primer elemento
            this.stats = Array.isArray(stats) ? (stats[0] ?? null) : stats ?? null;

            // Logs de depuración
            console.log('Equipo:', this.team);
            console.log('Stats:', this.stats);
          }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = 'Error inesperado al cargar los datos.';
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  // Helpers usados en la vista
  setTab(tab: 'ataque' | 'defensa' | 'disciplina' | 'medias'): void {
    this.activeTab = tab;
    this.cdr.markForCheck();
  }

  goBack(): void {
    this.router.navigate(['/equipos']);
  }

  has(val: any): boolean {
    return val !== null && val !== undefined;
  }
    onImageError(event: any): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    
    // Buscar o crear el contenedor de iniciales
    const container = img.parentElement;
    if (container) {
      let initialsDiv = container.querySelector('.avatar-initials');
      if (!initialsDiv) {
        initialsDiv = document.createElement('div');
        initialsDiv.className = 'avatar-initials';
        initialsDiv.textContent = this.team?.nombre?.charAt(0) ?? '?';
        container.appendChild(initialsDiv);
      }
    }
  }
}
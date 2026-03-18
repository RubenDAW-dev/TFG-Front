import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatchesService } from '../../services/matches.service';
import { TeamsService } from '../../services/teams.service';

@Component({
  selector: 'app-admin-partidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './AdminPartidosComponent.html',
  styleUrls: ['./AdminPartidosComponent.css']
})
export class AdminPartidosComponent implements OnInit {

  partidos: any[] = [];
  equipos: any[] = [];
  cargando = false;
  error: string | null = null;

  // FORM
  mostrarForm = false;
  editandoId: number | null = null;
  formData = {
    id: 0,
    homeTeamId: '',
    awayTeamId: '',
    wk: 0,
    day: '',
    date: '',
    time: '',
    score: '',
    attendance: 0,
    venue: '',
    referee: ''
  };

  // BÚSQUEDA Y FILTRADO
  busqueda = '';
  filtroSemana = '';
  partidosFiltrados: any[] = [];

  constructor(
    private matchesService: MatchesService,
    private teamsService: TeamsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPartidos();
    this.cargarEquipos();
  }

  cargarPartidos(): void {
    this.cargando = true;
    this.error = null;
    this.matchesService.getAll().subscribe({
      next: (data) => {
        this.partidos = data || [];
        this.partidosFiltrados = [...this.partidos];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar partidos';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarEquipos(): void {
    this.teamsService.getAllTeams().subscribe({
      next: (data) => {
        this.equipos = data || [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar equipos';
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.partidos];

    if (this.busqueda.trim()) {
      const busquedaLower = this.busqueda.toLowerCase();
      resultado = resultado.filter(p =>
        p.homeTeam?.nombre?.toLowerCase().includes(busquedaLower) ||
        p.awayTeam?.nombre?.toLowerCase().includes(busquedaLower) ||
        p.venue?.toLowerCase().includes(busquedaLower)
      );
    }

    if (this.filtroSemana) {
      resultado = resultado.filter(p => p.wk === parseInt(this.filtroSemana));
    }

    this.partidosFiltrados = resultado;
    this.cdr.detectChanges();
  }

  onBusquedaChange(): void {
    this.aplicarFiltros();
  }

  toggleForm(): void {
    this.mostrarForm = !this.mostrarForm;
    if (!this.mostrarForm) {
      this.resetForm();
    }
  }

  editarPartido(partido: any): void {
    this.editandoId = partido.id;
    this.formData = {
      id: partido.id,
      homeTeamId: partido.homeTeam?.id || '',
      awayTeamId: partido.awayTeam?.id || '',
      wk: partido.wk,
      day: partido.day,
      date: partido.date,
      time: partido.time,
      score: partido.score,
      attendance: partido.attendance,
      venue: partido.venue,
      referee: partido.referee
    };
    this.mostrarForm = true;
  }

  guardarPartido(): void {
    if (!this.formData.homeTeamId || !this.formData.awayTeamId) {
      this.error = 'Ambos equipos son obligatorios';
      return;
    }

    this.error = 'La funcionalidad de actualizar requiere endpoints en el backend';
    this.cdr.detectChanges();
  }

  eliminarPartido(id: number): void {
    if (!confirm('¿Eliminar este partido?')) return;
    
    this.error = 'La funcionalidad de eliminar requiere endpoints en el backend';
    this.cdr.detectChanges();
  }

  resetForm(): void {
    this.editandoId = null;
    this.formData = {
      id: 0,
      homeTeamId: '',
      awayTeamId: '',
      wk: 0,
      day: '',
      date: '',
      time: '',
      score: '',
      attendance: 0,
      venue: '',
      referee: ''
    };
  }

  getNombreEquipo(teamId: string): string {
    return this.equipos.find(e => e.id === teamId)?.nombre || 'N/A';
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroSemana = '';
    this.partidosFiltrados = [...this.partidos];
    this.cdr.detectChanges();
  }

}
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { MatchesService } from '../../services/matches.service';
import { TeamsService } from '../../services/teams.service';

@Component({
  selector: 'app-admin-partidos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    PaginatorModule,
    InputTextModule,
    TableModule,
    TooltipModule
  ],
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

  // PAGINACIÓN
  totalRecords = 0;
  rows = 20;
  first = 0;
  pagina = 1;

  // MODAL CONFIRMACIÓN
  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  modalAccionConfirmar: (() => void) | null = null;
  enviandoModal = false;

  constructor(
    private matchesService: MatchesService,
    private teamsService: TeamsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPartidos();
    this.cargarEquipos();
  }

  // ====================================
  // CARGAR DATOS
  // ====================================
  cargarPartidos(): void {
    this.cargando = true;
    this.error = null;
    this.matchesService.getAll().subscribe({
      next: (data) => {
        this.partidos = data || [];
        this.totalRecords = this.partidos.length;
        this.aplicarFiltros();
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

  // ====================================
  // FILTROS Y BÚSQUEDA
  // ====================================
  aplicarFiltros(): void {
    let resultado = [...this.partidos];

    if (this.busqueda.trim()) {
      const busquedaLower = this.busqueda.toLowerCase();
      resultado = resultado.filter(p => {
        const homeTeam = this.getNombreEquipo(p.homeTeam?.id)?.toLowerCase() || '';
        const awayTeam = this.getNombreEquipo(p.awayTeam?.id)?.toLowerCase() || '';
        const venue = p.venue?.toLowerCase() || '';
        return homeTeam.includes(busquedaLower) ||
               awayTeam.includes(busquedaLower) ||
               venue.includes(busquedaLower);
      });
    }

    if (this.filtroSemana) {
      resultado = resultado.filter(p => p.wk === parseInt(this.filtroSemana));
    }

    this.partidosFiltrados = resultado;
    this.totalRecords = resultado.length;
    this.first = 0;
    this.cdr.detectChanges();
  }

  onBusquedaChange(): void {
    this.aplicarFiltros();
  }

  onFiltroSemanaChange(): void {
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroSemana = '';
    this.partidosFiltrados = [...this.partidos];
    this.totalRecords = this.partidos.length;
    this.first = 0;
    this.cdr.detectChanges();
  }

  // ====================================
  // PAGINACIÓN
  // ====================================
  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.pagina = (event.first / event.rows) + 1;
  }

  getPartidosPaginados(): any[] {
    const inicio = this.first;
    const fin = inicio + this.rows;
    return this.partidosFiltrados.slice(inicio, fin);
  }

  // ====================================
  // UTILIDADES
  // ====================================
  getNombreEquipo(teamId: string): string {
    return this.equipos.find(e => String(e.id) === String(teamId))?.nombre || 'N/A';
  }

  getEscudoEquipo(teamId: string): string {
    const equipo = this.equipos.find(e => String(e.id) === String(teamId));
    return equipo?.escudo || equipo?.imagenUrl || '';
  }

  getResultadoClase(score: string | null | undefined): string {
    if (!score || !score.trim()) return 'score-pending';

    const parts = score.split('-').map(v => Number(v.trim()));
    if (parts.length !== 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) {
      return 'score-pending';
    }

    if (parts[0] > parts[1]) return 'score-home-win';
    if (parts[0] < parts[1]) return 'score-away-win';
    return 'score-draw';
  }

  // ====================================
  // FORM - SOLO EDITAR
  // ====================================
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

  guardarPartido(): void {
    if (!this.editandoId) {
      this.error = 'No hay partido seleccionado';
      return;
    }

    const homeTeam = this.getNombreEquipo(this.formData.homeTeamId);
    const awayTeam = this.getNombreEquipo(this.formData.awayTeamId);

    this.modalTitulo = 'Confirmar Edición';
    this.modalMensaje = `¿Estás seguro de que deseas actualizar el partido <strong>${homeTeam} vs ${awayTeam}</strong>?`;
    this.modalAccionConfirmar = () => this.confirmarGuardar();
    this.modalVisible = true;
  }

  private confirmarGuardar(): void {
    this.enviandoModal = true;

    this.matchesService.update(this.editandoId!, this.formData).subscribe({
      next: (response) => {
        // Actualizar en el array local
        const index = this.partidos.findIndex(p => p.id === this.editandoId);
        if (index !== -1) {
          this.partidos[index] = {
            ...this.partidos[index],
            ...this.formData
          };
        }
        this.aplicarFiltros();
        this.error = null;
        this.enviandoModal = false;
        this.cerrarFormulario();
        this.cerrarModal();
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al actualizar el partido';
        this.enviandoModal = false;
        this.cdr.detectChanges();
      }
    });
  }

  cerrarFormulario(): void {
    this.mostrarForm = false;
    this.resetForm();
    this.error = null;
    this.cdr.detectChanges();
  }

  // ====================================
  // MODAL CONFIRMACIÓN
  // ====================================
  cerrarModal(): void {
    this.modalVisible = false;
    this.modalAccionConfirmar = null;
    this.cdr.detectChanges();
  }

  confirmarAccion(): void {
    if (this.modalAccionConfirmar) {
      this.modalAccionConfirmar();
    }
  }

  // ====================================
  // DIALOG LIFECYCLE
  // ====================================
  onDialogShow(): void {
    this.cdr.detectChanges();
  }

  onDialogHide(): void {
    this.resetForm();
    this.error = null;
    this.cdr.detectChanges();
  }
}
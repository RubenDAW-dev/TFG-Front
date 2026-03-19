import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';
import { PlayersService } from '../../services/players.service';
import { TeamsService } from '../../services/teams.service';

@Component({
  selector: 'app-admin-jugadores',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    PaginatorModule,
    InputTextModule,
    TableModule,
    TooltipModule,
    NgSelectModule
  ],
  templateUrl: './adminJugadoresComponent.html',
  styleUrls: ['./adminJugadoresComponent.css']
})
export class AdminJugadoresComponent implements OnInit {

  jugadores: any[] = [];
  equipos: any[] = [];
  cargando = false;
  error: string | null = null;

  // FORM
  mostrarForm = false;
  editandoId: string | null = null;
  formData = {
    id: '',
    nombre: '',
    posicion: '',
    edad: 0,
    nacionalidad: '',
    imageUrl: '',
    teamId: ''
  };

  // BÚSQUEDA Y FILTRO
  busqueda = '';
  filtroEquipo: string | null = null;
  jugadoresFiltrados: any[] = [];

  // PAGINACIÓN
  totalRecords = 0;
  rows = 20;
  first = 0;
  pagina = 1;

  // MODAL CONFIRMACIÓN (guardar/eliminar)
  modalVisible = false;
  modalTipo: 'eliminar' | 'guardar' = 'eliminar';
  modalTitulo = '';
  modalMensaje = '';
  modalAccionConfirmar: (() => void) | null = null;
  jugadorSeleccionado: any = null;
  enviandoModal = false;

  constructor(
    private playersService: PlayersService,
    private teamsService: TeamsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarJugadores();
    this.cargarEquipos();
  }

  cargarJugadores(): void {
    this.cargando = true;
    this.error = null;
    this.playersService.getAllPlayers().subscribe({
      next: (data) => {
        this.jugadores = data || [];
        this.totalRecords = this.jugadores.length;
        this.aplicarFiltros();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar jugadores';
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
    let resultado = [...this.jugadores];

    if (this.busqueda.trim()) {
      const busquedaLower = this.busqueda.toLowerCase();
      resultado = resultado.filter(j =>
        j.nombre?.toLowerCase().includes(busquedaLower) ||
        j.posicion?.toLowerCase().includes(busquedaLower) ||
        j.nacionalidad?.toLowerCase().includes(busquedaLower)
      );
    }

    if (this.filtroEquipo) {
      resultado = resultado.filter(j => j.team?.id === this.filtroEquipo);
    }

    this.jugadoresFiltrados = resultado;
    this.totalRecords = resultado.length;
    this.first = 0;
    this.cdr.detectChanges();
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.pagina = (event.first / event.rows) + 1;
  }

  onBusquedaChange(): void {
    this.aplicarFiltros();
  }

  onFiltroEquipoChange(): void {
    this.aplicarFiltros();
  }

  editarJugador(jugador: any): void {
    this.editandoId = jugador.id;
    this.formData = {
      id: jugador.id,
      nombre: jugador.nombre,
      posicion: jugador.posicion,
      edad: jugador.edad,
      nacionalidad: jugador.nacionalidad,
      imageUrl: jugador.imageUrl,
      teamId: jugador.team?.id || ''
    };
    this.mostrarForm = true;
  }

  guardarJugador(): void {
    if (!this.formData.nombre || !this.formData.posicion) {
      this.error = 'Nombre y posición son obligatorios';
      return;
    }

    // Abrir modal de confirmación
    this.modalTipo = 'guardar';
    this.modalTitulo = this.editandoId ? 'Confirmar Edición' : 'Crear Jugador';
    this.modalMensaje = this.editandoId
      ? `¿Estás seguro de que deseas editar a ${this.formData.nombre}?`
      : `¿Crear nuevo jugador: ${this.formData.nombre}?`;
    this.modalAccionConfirmar = () => this.confirmarGuardar();
    this.modalVisible = true;
  }

  private confirmarGuardar(): void {
    this.enviandoModal = true;

    // Construir payload para el backend (DTO)
    const payload = {
      nombre: this.formData.nombre?.trim(),
      posicion: this.formData.posicion?.trim(),
      edad: Number(this.formData.edad) || 0,
      nacionalidad: this.formData.nacionalidad?.trim() || null,
      imageUrl: this.formData.imageUrl?.trim() || null,
      teamId: this.formData.teamId || null
    };

    const obs$ = this.editandoId
      ? this.playersService.updatePlayer(this.editandoId, payload)
      : this.playersService.createPlayer(payload);

    obs$.subscribe({
      next: () => {
        this.error = null;
        this.enviandoModal = false;
        this.modalVisible = false;
        this.mostrarForm = false;
        this.resetForm();
        this.cargarJugadores(); // refrescar tabla
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = (err?.error?.message || 'Error al guardar el jugador');
        this.enviandoModal = false;
        this.cdr.detectChanges();
      }
    });
  }

  eliminarJugador(id: string, nombre: string): void {
    this.jugadorSeleccionado = { id, nombre };
    this.modalTipo = 'eliminar';
    this.modalTitulo = 'Eliminar Jugador';
    this.modalMensaje = `¿Estás seguro de que deseas eliminar a <strong>${nombre}</strong>? Esta acción no se puede deshacer.`;
    // this.modalAccionConfirmar = () => this.confirmarEliminar(); // Implementa cuando tengas endpoint
    this.modalVisible = true;
  }

  private confirmarEliminar(): void {
    // Implementar cuando tengas endpoint de eliminar
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.modalAccionConfirmar = null;
    this.jugadorSeleccionado = null;
    this.cdr.detectChanges();
  }

  resetForm(): void {
    this.editandoId = null;
    this.formData = {
      id: '',
      nombre: '',
      posicion: '',
      edad: 0,
      nacionalidad: '',
      imageUrl: '',
      teamId: ''
    };
  }

  getNombreEquipo(teamId: string): string {
    return this.equipos.find(e => e.id === teamId)?.nombre || 'N/A';
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroEquipo = null;
    this.jugadoresFiltrados = [...this.jugadores];
    this.totalRecords = this.jugadores.length;
    this.first = 0;
    this.cdr.detectChanges();
  }

  confirmarAccion(): void {
    if (this.modalAccionConfirmar) {
      this.modalAccionConfirmar();
    }
  }

  getJugadoresPaginados(): any[] {
    const inicio = this.first;
    const fin = inicio + this.rows;
    return this.jugadoresFiltrados.slice(inicio, fin);
  }

  cerrarFormulario(): void {
    this.mostrarForm = false;
    this.resetForm();
    this.error = null;
    this.cdr.detectChanges();
  }

  toggleForm(): void {
    this.resetForm();
    this.mostrarForm = !this.mostrarForm;
    if (!this.mostrarForm) {
      this.resetForm();
      this.error = null;
    }
  }

  onDialogShow(): void {
    this.cdr.detectChanges();
  }

  onDialogHide(): void {
    this.resetForm();
    this.error = null;
  }
}
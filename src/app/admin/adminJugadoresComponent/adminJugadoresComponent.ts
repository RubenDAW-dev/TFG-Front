
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

  // BÚSQUEDA Y FILTRADO
  busqueda = '';
  filtroEquipo = '';
  jugadoresFiltrados: any[] = [];

  // PAGINACIÓN
  totalRecords = 0;
  rows = 20;
  first = 0;
  pagina = 1;

  // MODAL PRIMENG
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
    this.first = 0; // Reset a primera página
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
    // Aquí llamarías al servicio para guardar
    // this.playersService.actualizar(...)

    // Por ahora solo mostramos un mensaje
    this.error = 'La funcionalidad de actualizar requiere endpoints en el backend';
    this.enviandoModal = false;
    this.cerrarModal();
    this.cdr.detectChanges();
  }

  eliminarJugador(id: string, nombre: string): void {
    this.jugadorSeleccionado = { id, nombre };
    this.modalTipo = 'eliminar';
    this.modalTitulo = 'Eliminar Jugador';
    this.modalMensaje = `¿Estás seguro de que deseas eliminar a <strong>${nombre}</strong>? Esta acción no se puede deshacer.`;
    this.modalAccionConfirmar = () => this.confirmarEliminar();
    this.modalVisible = true;
  }

  private confirmarEliminar(): void {
    this.enviandoModal = true;
    // Aquí llamarías al servicio para eliminar
    // this.playersService.eliminar(this.jugadorSeleccionado.id)

    this.error = 'La funcionalidad de eliminar requiere endpoints en el backend';
    this.enviandoModal = false;
    this.cerrarModal();
    this.cdr.detectChanges();
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
    this.filtroEquipo = '';
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

  // Obtener jugadores paginados
  getJugadoresPaginados(): any[] {
    const inicio = this.first;
    const fin = inicio + this.rows;
    return this.jugadoresFiltrados.slice(inicio, fin);
  }
  // Agregar estos métodos a tu AdminJugadoresComponent

  cerrarFormulario(): void {
    this.mostrarForm = false;
    this.resetForm();
    this.error = null;
    this.cdr.detectChanges();
  }

  toggleForm(): void {
    this.mostrarForm = !this.mostrarForm;
    if (!this.mostrarForm) {
      this.resetForm();
      this.error = null;
    }
  }
}
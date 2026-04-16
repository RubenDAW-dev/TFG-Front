import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { Observable } from 'rxjs';
import { NgSelectModule } from '@ng-select/ng-select';
import { ComentarioService } from '../../services/comentario.service';
import { SearchItemDTO, SearchService } from '../../services/search.service';
import { AuthService } from '../../core/Auth/auth.service';
import { ComentarioResponseDTO, CrearComentarioDTO } from '../../shared/models/comentario';

type TipoComentarioFiltro = '' | 'topic' | 'respuesta';
type TargetTipo = 'equipo' | 'jugador' | 'partido';
type TargetFiltro = 'todos' | TargetTipo;

@Component({
  selector: 'app-admin-comentarios',
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
  templateUrl: './AdminComentariosComponent.html',
  styleUrls: ['./AdminComentariosComponent.css']
})
export class AdminComentariosComponent implements OnInit {
  comentarios: ComentarioResponseDTO[] = [];
  comentariosFiltrados: ComentarioResponseDTO[] = [];
  cargando = false;
  error: string | null = null;

  busqueda = '';
  filtroTipo: TipoComentarioFiltro = '';
  filtroTarget: TargetFiltro = 'todos';
  filtroTargetId: string | null = null;
  filtroTargetNombre: string | null = null;
  opcionesFiltroTarget: SearchItemDTO[] = [];
  cargandoFiltroTarget = false;

  totalRecords = 0;
  rows = 20;
  first = 0;
  pagina = 1;

  mostrarDetalles = false;
  comentarioSeleccionado: ComentarioResponseDTO | null = null;

  mostrarModalCrear = false;
  crearForm: {
    titulo: string;
    comentario: string;
    tipo: TargetTipo;
    targetId: string | null;
    targetNombre?: string | null;
  } = {
    titulo: '',
    comentario: '',
    tipo: 'equipo',
    targetId: null,
    targetNombre: null
  };
  crearError: string | null = null;
  enviandoCrear = false;
  opcionesCrearTarget: SearchItemDTO[] = [];
  cargandoCrearTarget = false;

  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  modalAccionConfirmar: (() => void) | null = null;
  comentarioAEliminar: ComentarioResponseDTO | null = null;
  enviandoModal = false;

  constructor(
    private comentarioService: ComentarioService,
    private searchService: SearchService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarComentarios();
  }

  cargarComentarios(): void {
    this.cargando = true;
    this.error = null;

    this.comentarioService.todosLosComentarios().subscribe({
      next: (data) => {
        this.comentarios = Array.isArray(data) ? data : [];
        this.totalRecords = this.comentarios.length;
        this.aplicarFiltros();
        this.cargando = false;
        this.cdr.detectChanges();
        console.log('Comentarios cargados:', this.comentarios);
      },
      error: () => {
        this.error = 'Error al cargar comentarios';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.comentarios];

    if (this.busqueda.trim()) {
      const busquedaLower = this.busqueda.toLowerCase();
      resultado = resultado.filter((comentario) =>
        comentario.titulo?.toLowerCase().includes(busquedaLower) ||
        comentario.comentario?.toLowerCase().includes(busquedaLower) ||
        comentario.usuarioNombre?.toLowerCase().includes(busquedaLower) ||
        comentario.targetNombre?.toLowerCase().includes(busquedaLower)
      );
    }

    if (this.filtroTipo === 'topic') {
      resultado = resultado.filter((comentario) => !comentario.comentarioPadreId);
    } else if (this.filtroTipo === 'respuesta') {
      resultado = resultado.filter((comentario) => !!comentario.comentarioPadreId);
    }

    if (this.filtroTarget !== 'todos') {
      if (this.filtroTarget === 'equipo') {
        resultado = resultado.filter((comentario) => !!comentario.equipoId);

        if (this.filtroTargetId) {
          resultado = resultado.filter((comentario) => comentario.equipoId === this.filtroTargetId);
        }
      } else if (this.filtroTarget === 'jugador') {
        resultado = resultado.filter((comentario) => !!comentario.jugadorId);

        if (this.filtroTargetId) {
          resultado = resultado.filter((comentario) => comentario.jugadorId === this.filtroTargetId);
        }
      } else if (this.filtroTarget === 'partido') {
        resultado = resultado.filter((comentario) => comentario.partidoId != null);

        if (this.filtroTargetId) {
          resultado = resultado.filter((comentario) => comentario.partidoId === Number(this.filtroTargetId));
        }
      }
    }

    this.comentariosFiltrados = resultado;
    this.totalRecords = resultado.length;
    this.first = 0;
    this.cdr.detectChanges();
  }

  onBusquedaChange(): void {
    this.aplicarFiltros();
  }

  onFiltroTipoChange(): void {
    this.aplicarFiltros();
  }

  onFiltroTargetChange(): void {
    this.filtroTargetId = null;
    this.filtroTargetNombre = null;
    this.opcionesFiltroTarget = [];

    this.aplicarFiltros();

    if (this.filtroTarget === 'todos') {
      return;
    }

    this.cargarOpcionesFiltroTarget();
  }

  onFiltroTargetIdChange(): void {
    const selectedEntity = this.opcionesFiltroTarget.find((opt) => opt.id === this.filtroTargetId);
    this.filtroTargetNombre = selectedEntity?.nombre || null;
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroTipo = '';
    this.filtroTarget = 'todos';
    this.filtroTargetId = null;
    this.filtroTargetNombre = null;
    this.opcionesFiltroTarget = [];
    this.comentariosFiltrados = [...this.comentarios];
    this.totalRecords = this.comentarios.length;
    this.first = 0;
    this.cdr.detectChanges();
  }

  onPageChange(event: any): void {
    this.first = event.first || 0;
    this.rows = event.rows || 20;
    this.pagina = Math.floor(event.first / event.rows) + 1;
  }

  abrirModalCrear(): void {
    this.crearForm = {
      titulo: '',
      comentario: '',
      tipo: 'equipo',
      targetId: null,
      targetNombre: null
    };
    this.crearError = null;
    this.opcionesCrearTarget = [];
    this.mostrarModalCrear = true;
    this.cargarOpcionesCrearTarget();
  }

  onCrearTipoChange(): void {
    this.crearForm.targetId = null;
    this.crearForm.targetNombre = null;
    this.opcionesCrearTarget = [];
    this.cargarOpcionesCrearTarget();
  }

  onCrearTargetIdChange(): void {
    const selectedEntity = this.opcionesCrearTarget.find(opt => opt.id === this.crearForm.targetId);
    this.crearForm.targetNombre = selectedEntity?.nombre || null;
  }

  guardarNuevoComentario(): void {
    this.crearError = null;

    const usuarioId = this.authService.currentUser()?.id;
    const titulo = this.crearForm.titulo.trim();
    const comentario = this.crearForm.comentario.trim();
    const targetId = this.crearForm.targetId;

    if (!usuarioId) {
      this.crearError = 'No se ha podido identificar el usuario administrador.';
      return;
    }

    if (!titulo || !comentario || !targetId) {
      this.crearError = 'Completa todos los campos.';
      return;
    }

    const payload: CrearComentarioDTO = {
      titulo,
      comentario,
      usuarioId
    };

    if (this.crearForm.tipo === 'equipo') {
      payload.equipoId = targetId;
    } else if (this.crearForm.tipo === 'jugador') {
      payload.jugadorId = targetId;
    } else {
      payload.partidoId = Number(targetId);
    }

    this.enviandoCrear = true;
    this.comentarioService.crear(payload).subscribe({
      next: () => {
        this.enviandoCrear = false;
        this.cerrarModalCrear();
        this.cargarComentarios();
      },
      error: () => {
        this.enviandoCrear = false;
        this.crearError = 'No se pudo crear el comentario. Intentalo de nuevo.';
        this.cdr.detectChanges();
      }
    });
  }

  cerrarModalCrear(): void {
    this.mostrarModalCrear = false;
    this.crearError = null;
    this.crearForm = {
      titulo: '',
      comentario: '',
      tipo: 'equipo',
      targetId: null,
      targetNombre: null
    };
    this.opcionesCrearTarget = [];
    this.cdr.detectChanges();
  }

  getTipoComentario(comentario: ComentarioResponseDTO | null): string {
    if (!comentario) {
      return 'N/A';
    }

    return comentario.comentarioPadreId ? 'RESPUESTA' : 'TOPIC';
  }

  getTargetType(comentario: ComentarioResponseDTO | null): TargetTipo | null {
    if (!comentario) {
      return null;
    }

    if (comentario.equipoId) {
      return 'equipo';
    }

    if (comentario.jugadorId) {
      return 'jugador';
    }

    if (comentario.partidoId) {
      return 'partido';
    }

    return null;
  }

  getTargetIcon(comentario: ComentarioResponseDTO | null): string {
    const targetType = this.getTargetType(comentario);

    if (targetType === 'equipo') {
      return 'pi pi-shield';
    }

    if (targetType === 'jugador') {
      return 'pi pi-user';
    }

    if (targetType === 'partido') {
      return 'pi pi-calendar';
    }

    return 'pi pi-tag';
  }

  getTargetLabel(comentario: ComentarioResponseDTO | null): string {
    if (!comentario) {
      return 'N/A';
    }

    return comentario.targetNombre || 'N/A';
  }

  getFilterTargetLabel(): string {
    if (!this.filtroTargetNombre) {
      return '';
    }

    return `${this.filtroTargetNombre}`;
  }

  getFilterTargetIcon(): string {
    if (this.filtroTarget === 'equipo') {
      return 'pi pi-shield';
    }

    if (this.filtroTarget === 'jugador') {
      return 'pi pi-user';
    }

    if (this.filtroTarget === 'partido') {
      return 'pi pi-calendar';
    }

    return 'pi pi-tag';
  }

  verDetalles(comentario: ComentarioResponseDTO): void {
    this.comentarioSeleccionado = comentario;
    this.mostrarDetalles = true;
  }

  cerrarDetalles(): void {
    this.mostrarDetalles = false;
    this.comentarioSeleccionado = null;
    this.cdr.detectChanges();
  }

  eliminarComentario(id: number, titulo?: string): void {
    const comentario = this.comentarios.find((item) => item.id === id) || null;
    this.comentarioAEliminar = comentario;
    this.modalTitulo = 'Eliminar Comentario';
    this.modalMensaje = `¿Estas seguro de que deseas eliminar ${titulo ? `<strong>${titulo}</strong>` : 'este comentario'}? Esta accion no se puede deshacer.`;
    this.modalAccionConfirmar = () => this.confirmarEliminar();
    this.mostrarDetalles = false;
    this.modalVisible = true;
  }

  private confirmarEliminar(): void {
    if (!this.comentarioAEliminar) {
      return;
    }

    this.enviandoModal = true;
    this.comentarioService.eliminar(this.comentarioAEliminar.id).subscribe({
      next: () => {
        this.comentarios = this.comentarios.filter((comentario) => comentario.id !== this.comentarioAEliminar?.id);
        this.aplicarFiltros();
        this.error = null;
        this.enviandoModal = false;
        this.cerrarModal();
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al eliminar el comentario';
        this.enviandoModal = false;
        this.cdr.detectChanges();
      }
    });
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.modalAccionConfirmar = null;
    this.comentarioAEliminar = null;
    this.cdr.detectChanges();
  }

  confirmarAccion(): void {
    this.modalAccionConfirmar?.();
  }

  onDialogShow(): void {
    this.cdr.detectChanges();
  }

  onDialogHide(): void {
    this.mostrarDetalles = false;
    this.mostrarModalCrear = false;
    this.comentarioSeleccionado = null;
    this.error = null;
    this.crearError = null;
    this.cdr.detectChanges();
  }

  private cargarOpcionesFiltroTarget(): void {
    if (this.filtroTarget === 'todos') {
      return;
    }

    this.cargandoFiltroTarget = true;
    this.obtenerTargets(this.filtroTarget).subscribe({
      next: (items) => {
        this.opcionesFiltroTarget = items;
        this.cargandoFiltroTarget = false;
        this.aplicarFiltros();
      },
      error: () => {
        this.opcionesFiltroTarget = [];
        this.cargandoFiltroTarget = false;
        this.cdr.detectChanges();
      }
    });
  }

  private cargarOpcionesCrearTarget(): void {
    this.cargandoCrearTarget = true;
    this.obtenerTargets(this.crearForm.tipo).subscribe({
      next: (items) => {
        this.opcionesCrearTarget = items;
        this.cargandoCrearTarget = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.opcionesCrearTarget = [];
        this.cargandoCrearTarget = false;
        this.cdr.detectChanges();
      }
    });
  }

  private obtenerTargets(tipo: TargetTipo): Observable<SearchItemDTO[]> {
    if (tipo === 'equipo') {
      return this.searchService.buscarEquipos('');
    }

    if (tipo === 'jugador') {
      return this.searchService.buscarJugadores('');
    }

    return this.searchService.buscarPartidos('');
  }
}
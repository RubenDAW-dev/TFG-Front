import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { ComentarioService } from '../services/comentario.service';
import { AuthService } from '../core/Auth/auth.service';
import { SearchService, SearchItemDTO } from '../services/search.service';
import { ComentarioResponseDTO, CrearComentarioDTO } from '../shared/models/comentario';
import { NgSelectComponent } from '@ng-select/ng-select';

type Vista = 'lista' | 'hilo';
type TargetTipo = 'equipo' | 'jugador' | 'partido';

@Component({
  selector: 'app-foro-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgSelectComponent],
  templateUrl: './foro.html',
  styleUrls: ['./foro.css']
})
export class Foro implements OnInit {

  vista: Vista = 'lista';
  topicActivo: ComentarioResponseDTO | null = null;

  topics: ComentarioResponseDTO[] = [];
  topicsOriginal: ComentarioResponseDTO[] = [];
  cargandoLista = false;
  errorLista: string | null = null;

  // BÚSQUEDA Y FILTRADO
  busquedaTexto = '';
  filtroTarget: 'todos' | 'equipo' | 'jugador' | 'partido' = 'todos';
  filtroTargetId = '';

  mostrarFormNuevo = false;
  nuevoTitulo = '';
  nuevoTexto = '';
  targetTipo: TargetTipo = 'equipo';
  selectedTargetId = '';
  opcionesSelect: SearchItemDTO[] = [];
  cargandoOpciones = false;
  enviandoTopic = false;
  errorForm: string | null = null;

  cargandoHilo = false;
  respuestaTexto = '';
  enviandoResp = false;
  errorHilo: string | null = null;

  // EDICIÓN
  editandoId: number | null = null;
  editandoTexto = '';
  enviandoEdicion = false;

  constructor(
    private comentarioService: ComentarioService,
    public authService: AuthService,
    private searchService: SearchService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarTopics();
  }

  // ── LISTA ──────────────────────────────────────────────────────────────────

  cargarTopics(): void {
    this.cargandoLista = true;
    this.errorLista = null;
    this.comentarioService.foroTopics().subscribe({
      next: (data) => {
        this.topics = Array.isArray(data) ? data : [];
        this.topicsOriginal = [...this.topics];
        this.cargandoLista = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorLista = 'No se pudieron cargar los topics.';
        this.cargandoLista = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── BÚSQUEDA Y FILTRADO ────────────────────────────────────────────────────

  onBusquedaChange(): void {
    this.aplicarFiltros();
  }

  onFiltroTargetChange(): void {
    this.filtroTargetId = '';
    this.cargarOpcionesFiltro();
  }

  aplicarFiltros(): void {
    let resultado = [...this.topicsOriginal];

    // Filtro por texto
    if (this.busquedaTexto.trim()) {
      const busqueda = this.busquedaTexto.toLowerCase();
      resultado = resultado.filter(t =>
        t.titulo.toLowerCase().includes(busqueda) ||
        t.comentario.toLowerCase().includes(busqueda) ||
        t.usuarioNombre.toLowerCase().includes(busqueda) ||
        (t.targetNombre ? t.targetNombre.toLowerCase().includes(busqueda) : false)
      );
    }

    // Filtro por target
    if (this.filtroTarget !== 'todos') {
      resultado = resultado.filter(t => {
        if (this.filtroTarget === 'equipo') return t.equipoId !== null;
        if (this.filtroTarget === 'jugador') return t.jugadorId !== null;
        if (this.filtroTarget === 'partido') return t.partidoId !== null;
        return true;
      });

      // Filtro específico por ID
      if (this.filtroTargetId) {
        resultado = resultado.filter(t => {
          if (this.filtroTarget === 'equipo') return t.equipoId === this.filtroTargetId;
          if (this.filtroTarget === 'jugador') return t.jugadorId === this.filtroTargetId;
          if (this.filtroTarget === 'partido') return t.partidoId === Number(this.filtroTargetId);
          return true;
        });
      }
    }

    this.topics = resultado;
    this.cdr.detectChanges();
  }

  abrirHilo(topic: ComentarioResponseDTO): void {
    this.cargandoHilo = true;
    this.errorHilo = null;
    this.vista = 'hilo';
    this.topicActivo = topic;
    this.comentarioService.obtenerTopic(topic.id).subscribe({
      next: (data) => {
        this.topicActivo = data;
        this.cargandoHilo = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorHilo = 'Error al cargar el hilo.';
        this.cargandoHilo = false;
        this.cdr.detectChanges();
      }
    });
  }

  volverALista(): void {
    this.vista = 'lista';
    this.topicActivo = null;
    this.respuestaTexto = '';
    this.errorHilo = null;
    this.editandoId = null;
    this.cargarTopics();
  }

  // ── SELECT: cargar opciones al abrir formulario o cambiar tipo ─────────────

  toggleFormNuevo(): void {
    this.mostrarFormNuevo = !this.mostrarFormNuevo;
    if (this.mostrarFormNuevo) {
      this.cargarOpciones();
    } else {
      this.resetForm();
    }
  }

  onTargetTipoChange(): void {
    this.selectedTargetId = '';
    this.cargarOpciones();
  }

  cargarOpciones(): void {
    this.cargandoOpciones = true;
    this.opcionesSelect = [];

    let obs$;
    if (this.targetTipo === 'equipo') obs$ = this.searchService.buscarEquipos('');
    else if (this.targetTipo === 'jugador') obs$ = this.searchService.buscarJugadores('');
    else obs$ = this.searchService.buscarPartidos('');

    obs$.subscribe({
      next: (data) => {
        this.opcionesSelect = data;
        this.cargandoOpciones = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoOpciones = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarOpcionesFiltro(): void {
    this.cargandoOpciones = true;
    this.opcionesSelect = [];

    if (this.filtroTarget === 'todos') {
      this.cargandoOpciones = false;
      this.aplicarFiltros();
      this.cdr.detectChanges();
      return;
    }

    let obs$;
    if (this.filtroTarget === 'equipo') obs$ = this.searchService.buscarEquipos('');
    else if (this.filtroTarget === 'jugador') obs$ = this.searchService.buscarJugadores('');
    else obs$ = this.searchService.buscarPartidos('');

    obs$.subscribe({
      next: (data) => {
        this.opcionesSelect = data;
        this.cargandoOpciones = false;
        this.aplicarFiltros();
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoOpciones = false;
        this.aplicarFiltros();
        this.cdr.detectChanges();
      }
    });
  }

  // ── CREAR TOPIC ────────────────────────────────────────────────────────────

  enviarTopic(): void {
    if (!this.nuevoTitulo.trim()) { this.errorForm = 'El título es obligatorio.'; return; }
    if (!this.nuevoTexto.trim()) { this.errorForm = 'El mensaje es obligatorio.'; return; }
    if (!this.selectedTargetId) { this.errorForm = 'Selecciona un equipo, jugador o partido.'; return; }

    const dto: CrearComentarioDTO = {
      titulo: this.nuevoTitulo.trim(),
      comentario: this.nuevoTexto.trim(),
      usuarioId: this.authService.currentUser()!.id,
    };

    if (this.targetTipo === 'equipo') dto.equipoId = this.selectedTargetId;
    if (this.targetTipo === 'jugador') dto.jugadorId = this.selectedTargetId;
    if (this.targetTipo === 'partido') dto.partidoId = Number(this.selectedTargetId);

    this.enviandoTopic = true;
    this.errorForm = null;

    this.comentarioService.crear(dto).subscribe({
      next: () => {
        this.resetForm();
        this.mostrarFormNuevo = false;
        this.enviandoTopic = false;
        this.cargarTopics();
      },
      error: () => {
        this.errorForm = 'Error al crear el topic.';
        this.enviandoTopic = false;
        this.cdr.detectChanges();
      }
    });
  }

  private resetForm(): void {
    this.nuevoTitulo = '';
    this.nuevoTexto = '';
    this.targetTipo = 'equipo';
    this.selectedTargetId = '';
    this.opcionesSelect = [];
    this.errorForm = null;
  }

  // ── RESPONDER EN HILO ──────────────────────────────────────────────────────

  enviarRespuesta(): void {
    if (!this.respuestaTexto.trim() || !this.topicActivo || this.enviandoResp) return;

    const dto: CrearComentarioDTO = {
      comentario: this.respuestaTexto.trim(),
      usuarioId: this.authService.currentUser()!.id,
      comentarioPadreId: this.topicActivo.id,
    };

    if (this.topicActivo.equipoId) dto.equipoId = this.topicActivo.equipoId;
    if (this.topicActivo.jugadorId) dto.jugadorId = this.topicActivo.jugadorId;
    if (this.topicActivo.partidoId) dto.partidoId = this.topicActivo.partidoId;

    this.enviandoResp = true;
    this.errorHilo = null;

    this.comentarioService.crear(dto).subscribe({
      next: () => {
        this.respuestaTexto = '';
        this.enviandoResp = false;
        this.abrirHilo(this.topicActivo!);
      },
      error: (err) => {
        if (err.status === 403 || err.status === 500) {
          this.respuestaTexto = '';
          this.enviandoResp = false;
          this.abrirHilo(this.topicActivo!);
        } else {
          this.errorHilo = 'Error al enviar la respuesta.';
          this.enviandoResp = false;
          this.cdr.detectChanges();
        }
      }
    });
  }

  // ── EDITAR COMENTARIO ──────────────────────────────────────────────────────

  iniciarEdicion(comentario: ComentarioResponseDTO, esTopic = false): void {
    this.editandoId = comentario.id;
    this.editandoTexto = esTopic ? (comentario.titulo ?? '') : (comentario.comentario ?? '');
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.editandoTexto = '';
  }

  guardarEdicion(comentarioId: number, esTopic = false): void {
    if (!this.editandoTexto.trim()) {
      this.errorHilo = 'El texto no puede estar vacío.';
      return;
    }

    this.enviandoEdicion = true;
    this.errorHilo = null;

    const dto: any = {
      id: comentarioId,
    };
    
    if (esTopic) {
      dto.titulo = this.editandoTexto.trim();
    } else {
      dto.comentario = this.editandoTexto.trim();
    }

    this.comentarioService.actualizar(dto).subscribe({
      next: () => {
        this.enviandoEdicion = false;
        this.editandoId = null;
        this.editandoTexto = '';
        if (this.topicActivo) {
          this.abrirHilo(this.topicActivo);
        }
      },
      error: () => {
        this.errorHilo = 'Error al guardar la edición.';
        this.enviandoEdicion = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── ELIMINAR ──────────────────────────────────────────────────────────────

  eliminar(id: number, esTopic = false): void {
    if (!confirm('¿Eliminar este comentario?')) return;
    this.comentarioService.eliminar(id).subscribe({
      next: () => esTopic ? this.volverALista() : this.abrirHilo(this.topicActivo!),
      error: () => { this.errorHilo = 'Error al eliminar.'; this.cdr.detectChanges(); }
    });
  }

  // ── HELPERS ────────────────────────────────────────────────────────────────

  puedeEditar(usuarioId: number): boolean {
    return this.authService.currentUser()?.id === usuarioId || this.authService.isAdmin();
  }

  targetLabel(topic: ComentarioResponseDTO): string {
    if (topic.equipoId) return '🛡 ' + (topic.targetNombre || topic.equipoId || '');
    if (topic.jugadorId) return '👤 ' + (topic.targetNombre || topic.jugadorId || '');
    if (topic.partidoId) return '⚽ ' + (topic.targetNombre || ('Partido ' + topic.partidoId) || '');
    return '';
  }

  trackById(_: number, item: ComentarioResponseDTO): number { return item.id; }
}
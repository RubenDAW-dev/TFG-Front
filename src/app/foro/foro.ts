import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { ComentarioService } from '../services/comentario.service';
import { AuthService } from '../core/Auth/auth.service';
import { SearchService, SearchItemDTO } from '../services/search.service';
import { ComentarioResponseDTO, CrearComentarioDTO } from '../shared/models/comentario';

type Vista = 'lista' | 'hilo';
type TargetTipo = 'equipo' | 'jugador' | 'partido';

@Component({
  selector: 'app-foro-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './foro.html',
  styleUrls: ['./foro.css']
})
export class Foro implements OnInit {

  vista: Vista = 'lista';
  topicActivo: ComentarioResponseDTO | null = null;

  topics: ComentarioResponseDTO[] = [];
  cargandoLista = false;
  errorLista: string | null = null;

  mostrarFormNuevo = false;
  nuevoTitulo    = '';
  nuevoTexto     = '';
  targetTipo: TargetTipo = 'equipo';
  selectedTargetId = '';          // id seleccionado en el <select>
  opcionesSelect: SearchItemDTO[] = [];
  cargandoOpciones = false;
  enviandoTopic  = false;
  errorForm: string | null = null;

  cargandoHilo   = false;
  respuestaTexto = '';
  enviandoResp   = false;
  errorHilo: string | null = null;

  constructor(
    private comentarioService: ComentarioService,
    public authService: AuthService,
    private searchService: SearchService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarTopics();
  }

  // ── LISTA ──────────────────────────────────────────────────────────────────

  cargarTopics(): void {
    this.cargandoLista = true;
    this.errorLista    = null;
    this.comentarioService.foroTopics().subscribe({
      next: (data) => {
        this.topics        = Array.isArray(data) ? data : [];
        this.cargandoLista = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorLista    = 'No se pudieron cargar los topics.';
        this.cargandoLista = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirHilo(topic: ComentarioResponseDTO): void {
    this.cargandoHilo = true;
    this.errorHilo    = null;
    this.vista        = 'hilo';
    this.topicActivo  = topic;
    this.comentarioService.obtenerTopic(topic.id).subscribe({
      next: (data) => {
        this.topicActivo  = data;
        this.cargandoHilo = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorHilo    = 'Error al cargar el hilo.';
        this.cargandoHilo = false;
        this.cdr.detectChanges();
      }
    });
  }

  volverALista(): void {
    this.vista          = 'lista';
    this.topicActivo    = null;
    this.respuestaTexto = '';
    this.errorHilo      = null;
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
    this.opcionesSelect   = [];

    let obs$;
    if (this.targetTipo === 'equipo')  obs$ = this.searchService.buscarEquipos('');
    else if (this.targetTipo === 'jugador') obs$ = this.searchService.buscarJugadores('');
    else obs$ = this.searchService.buscarPartidos('');

    obs$.subscribe({
      next: (data) => {
        this.opcionesSelect   = data;
        this.cargandoOpciones = false;
        this.cdr.detectChanges();
        console.log('Opciones para ' + this.targetTipo, data);
      },
      error: () => {
        this.cargandoOpciones = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── CREAR TOPIC ────────────────────────────────────────────────────────────

  enviarTopic(): void {
    if (!this.nuevoTitulo.trim())   { this.errorForm = 'El título es obligatorio.'; return; }
    if (!this.nuevoTexto.trim())    { this.errorForm = 'El mensaje es obligatorio.'; return; }
    if (!this.selectedTargetId)     { this.errorForm = 'Selecciona un equipo, jugador o partido.'; return; }

    const dto: CrearComentarioDTO = {
      titulo:     this.nuevoTitulo.trim(),
      comentario: this.nuevoTexto.trim(),
      usuarioId:  this.authService.currentUser()!.id,
    };

    if (this.targetTipo === 'equipo')  dto.equipoId  = this.selectedTargetId;
    if (this.targetTipo === 'jugador') dto.jugadorId = this.selectedTargetId;
    if (this.targetTipo === 'partido') dto.partidoId = Number(this.selectedTargetId);

    this.enviandoTopic = true;
    this.errorForm     = null;

    this.comentarioService.crear(dto).subscribe({
      next: () => {
        this.resetForm();
        this.mostrarFormNuevo = false;
        this.enviandoTopic    = false;
        this.cargarTopics();
      },
      error: () => {
        this.errorForm     = 'Error al crear el topic.';
        this.enviandoTopic = false;
        this.cdr.detectChanges();
      }
    });
  }

  private resetForm(): void {
    this.nuevoTitulo      = '';
    this.nuevoTexto       = '';
    this.targetTipo       = 'equipo';
    this.selectedTargetId = '';
    this.opcionesSelect   = [];
    this.errorForm        = null;
  }

  // ── RESPONDER EN HILO ──────────────────────────────────────────────────────

  enviarRespuesta(): void {
    if (!this.respuestaTexto.trim() || !this.topicActivo || this.enviandoResp) return;

    const dto: CrearComentarioDTO = {
      comentario:        this.respuestaTexto.trim(),
      usuarioId:         this.authService.currentUser()!.id,
      comentarioPadreId: this.topicActivo.id,
    };

    if (this.topicActivo.equipoId)  dto.equipoId  = this.topicActivo.equipoId;
    if (this.topicActivo.jugadorId) dto.jugadorId = this.topicActivo.jugadorId;
    if (this.topicActivo.partidoId) dto.partidoId = this.topicActivo.partidoId;

    this.enviandoResp = true;
    this.errorHilo    = null;

    this.comentarioService.crear(dto).subscribe({
      next: () => {
        this.respuestaTexto = '';
        this.enviandoResp   = false;
        this.abrirHilo(this.topicActivo!);
      },
      error: (err) => {
        // 403 suele ser error de serialización en el backend — el comentario
        // sí se creó, recargamos el hilo igualmente
        if (err.status === 403 || err.status === 500) {
          this.respuestaTexto = '';
          this.enviandoResp   = false;
          this.abrirHilo(this.topicActivo!);
        } else {
          this.errorHilo    = 'Error al enviar la respuesta.';
          this.enviandoResp = false;
          this.cdr.detectChanges();
        }
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
    if (topic.equipoId)  return '🛡 ' + (topic.targetNombre || topic.equipoId);
    if (topic.jugadorId) return '👤 ' + (topic.targetNombre || topic.jugadorId);
    if (topic.partidoId) return '⚽ ' + (topic.targetNombre || 'Partido ' + topic.partidoId);
    return '';
  }

  trackById(_: number, item: ComentarioResponseDTO): number { return item.id; }
}
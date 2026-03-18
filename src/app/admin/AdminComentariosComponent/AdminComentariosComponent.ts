import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComentarioService } from '../../services/comentario.service';

@Component({
  selector: 'app-admin-comentarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './AdminComentariosComponent.html',
  styleUrls: ['./AdminComentariosComponent.css']
})
export class AdminComentariosComponent implements OnInit {

  comentarios: any[] = [];
  cargando = false;
  error: string | null = null;
  mensajeExito: string | null = null;

  // BÚSQUEDA Y FILTRADO
  busqueda = '';
  filtroTipo = ''; // todos, topic, respuesta
  comentariosFiltrados: any[] = [];

  // MODAL DE DETALLES
  mostrarDetalles = false;
  comentarioSeleccionado: any = null;

  constructor(
    private comentarioService: ComentarioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarComentarios();
  }

  cargarComentarios(): void {
    this.cargando = true;
    this.error = null;
    this.comentarioService.foroTopics().subscribe({
      next: (topics) => {
        // Incluir también las respuestas
        this.comentarios = topics || [];
        this.comentariosFiltrados = [...this.comentarios];
        this.cargando = false;
        this.cdr.detectChanges();
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
      resultado = resultado.filter(c =>
        c.titulo?.toLowerCase().includes(busquedaLower) ||
        c.comentario?.toLowerCase().includes(busquedaLower) ||
        c.usuarioNombre?.toLowerCase().includes(busquedaLower)
      );
    }

    if (this.filtroTipo === 'topic') {
      resultado = resultado.filter(c => c.comentarioPadreId === null || c.comentarioPadreId === undefined);
    } else if (this.filtroTipo === 'respuesta') {
      resultado = resultado.filter(c => c.comentarioPadreId !== null && c.comentarioPadreId !== undefined);
    }

    this.comentariosFiltrados = resultado;
    this.cdr.detectChanges();
  }

  onBusquedaChange(): void {
    this.aplicarFiltros();
  }

  onFiltroTipoChange(): void {
    this.aplicarFiltros();
  }

  verDetalles(comentario: any): void {
    this.comentarioSeleccionado = comentario;
    this.mostrarDetalles = true;
    this.cdr.detectChanges();
  }

  cerrarDetalles(): void {
    this.mostrarDetalles = false;
    this.comentarioSeleccionado = null;
    this.cdr.detectChanges();
  }

  eliminarComentario(id: number, titulo: string): void {
    if (!confirm(`¿Eliminar comentario: "${titulo || 'Sin título'}"?`)) return;

    this.comentarioService.eliminar(id).subscribe({
      next: () => {
        this.mensajeExito = 'Comentario eliminado correctamente';
        this.cerrarDetalles();
        this.cargarComentarios();
        setTimeout(() => {
          this.mensajeExito = null;
          this.cdr.detectChanges();
        }, 3000);
      },
      error: () => {
        this.error = 'Error al eliminar comentario';
        this.cdr.detectChanges();
      }
    });
  }

  getTipoComentario(comentario: any): string {
    return comentario.comentarioPadreId ? 'Respuesta' : 'Topic';
  }

  getTargetLabel(comentario: any): string {
    if (comentario.equipoId) return '⚽ ' + (comentario.targetNombre || comentario.equipoId);
    if (comentario.jugadorId) return '👤 ' + (comentario.targetNombre || comentario.jugadorId);
    if (comentario.partidoId) return '🗓 ' + (comentario.targetNombre || 'Partido ' + comentario.partidoId);
    return '—';
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroTipo = '';
    this.comentariosFiltrados = [...this.comentarios];
    this.cdr.detectChanges();
  }

}
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ComentarioService } from '../../services/comentario.service';

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
    TooltipModule
  ],
  templateUrl: './adminComentariosComponent.html',
  styleUrls: ['./adminComentariosComponent.css']
})
export class AdminComentariosComponent implements OnInit {

  comentarios: any[] = [];
  comentariosFiltrados: any[] = [];
  cargando = false;
  error: string | null = null;

  // BÚSQUEDA Y FILTRADO
  busqueda = '';
  filtroTipo = '';

  // PAGINACIÓN
  totalRecords = 0;
  rows = 20;
  first = 0;
  pagina = 1;

  // MODAL DETALLES
  mostrarDetalles = false;
  comentarioSeleccionado: any = null;

  // MODAL CONFIRMACIÓN
  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  modalAccionConfirmar: (() => void) | null = null;
  enviandoModal = false;

  constructor(
    private comentarioService: ComentarioService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarComentarios();
  }

  // ====================================
  // CARGAR DATOS
  // ====================================
  cargarComentarios(): void {
    this.cargando = true;
    this.error = null;
    this.comentarioService.foroTopics().subscribe({
      next: (data) => {
        this.comentarios = data || [];
        this.totalRecords = this.comentarios.length;
        this.aplicarFiltros();
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

  // ====================================
  // FILTROS Y BÚSQUEDA
  // ====================================
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

    if (this.filtroTipo) {
      if (this.filtroTipo === 'topic') {
        resultado = resultado.filter(c => !c.comentarioPadreId);
      } else if (this.filtroTipo === 'respuesta') {
        resultado = resultado.filter(c => c.comentarioPadreId);
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

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroTipo = '';
    this.comentariosFiltrados = [...this.comentarios];
    this.totalRecords = this.comentarios.length;
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

  getComentariosPaginados(): any[] {
    const inicio = this.first;
    const fin = inicio + this.rows;
    return this.comentariosFiltrados.slice(inicio, fin);
  }

  // ====================================
  // UTILIDADES
  // ====================================
  getTipoComentario(comentario: any): string {
    return comentario.comentarioPadreId ? 'RESPUESTA' : 'TOPIC';
  }

  getTargetLabel(comentario: any): string {
    if (comentario.videoId) return `Video #${comentario.videoId}`;
    if (comentario.articleId) return `Artículo #${comentario.articleId}`;
    return 'N/A';
  }

  // ====================================
  // MODAL DETALLES
  // ====================================
  verDetalles(comentario: any): void {
    this.comentarioSeleccionado = comentario;
    this.mostrarDetalles = true;
  }

  cerrarDetalles(): void {
    this.mostrarDetalles = false;
    this.comentarioSeleccionado = null;
    this.cdr.detectChanges();
  }

  // ====================================
  // ELIMINAR
  // ====================================
  eliminarComentario(id: string, titulo: string): void {
    this.comentarioSeleccionado = { id, titulo };
    this.modalTitulo = 'Eliminar Comentario';
    this.modalMensaje = `¿Estás seguro de que deseas eliminar este comentario? Esta acción no se puede deshacer.`;
    this.modalAccionConfirmar = () => this.confirmarEliminar();
    this.cerrarDetalles();
    this.modalVisible = true;
  }

  private confirmarEliminar(): void {
    this.enviandoModal = true;
    
    // Llamar al servicio para eliminar
    this.comentarioService.eliminar(Number(this.comentarioSeleccionado.id)).subscribe({
      next: () => {
        // Eliminar del array local
        this.comentarios = this.comentarios.filter(c => c.id !== this.comentarioSeleccionado.id);
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

  // ====================================
  // MODAL CONFIRMACIÓN
  // ====================================
  cerrarModal(): void {
    this.modalVisible = false;
    this.modalAccionConfirmar = null;
    this.comentarioSeleccionado = null;
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
    this.error = null;
    this.cdr.detectChanges();
  }
}
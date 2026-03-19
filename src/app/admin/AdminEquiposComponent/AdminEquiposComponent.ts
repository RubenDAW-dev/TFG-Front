import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TeamsService } from '../../services/teams.service';


@Component({
  selector: 'app-admin-equipos',
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
  templateUrl: './adminEquiposComponent.html',
  styleUrls: ['./adminEquiposComponent.css']
})
export class AdminEquiposComponent implements OnInit {

  equipos: any[] = [];
  equiposFiltrados: any[] = [];
  cargando = false;
  error: string | null = null;

  // FORM
  mostrarForm = false;
  editandoId: string | null = null;
  formData = {
    id: '',
    nombre: '',
    ciudad: '',
    estadio: '',
    capacidad: 0,
    escudo: ''
  };

  // BÚSQUEDA Y FILTRADO
  busqueda = '';

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
  equipoSeleccionado: any = null;
  enviandoModal = false;

  constructor(
    private equiposService: TeamsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarEquipos();
  }

  cargarEquipos(): void {
    this.cargando = true;
    this.error = null;
    this.equiposService.getAllTeams().subscribe({
      next: (data) => {
        this.equipos = data || [];
        this.totalRecords = this.equipos.length;
        this.aplicarFiltros();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar equipos';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.equipos];

    if (this.busqueda.trim()) {
      const busquedaLower = this.busqueda.toLowerCase();
      resultado = resultado.filter(e =>
        e.nombre?.toLowerCase().includes(busquedaLower) ||
        e.ciudad?.toLowerCase().includes(busquedaLower) ||
        e.estadio?.toLowerCase().includes(busquedaLower)
      );
    }

    this.equiposFiltrados = resultado;
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

  editarEquipo(equipo: any): void {
    this.editandoId = equipo.id;
    this.formData = {
      id: equipo.id,
      nombre: equipo.nombre,
      ciudad: equipo.ciudad,
      estadio: equipo.estadio,
      capacidad: equipo.capacidad,
      escudo: equipo.escudo
    };
    this.mostrarForm = true;
  }

  guardarEquipo(): void {
    if (!this.formData.nombre || !this.formData.ciudad) {
      this.error = 'Nombre y ciudad son obligatorios';
      return;
    }

    this.modalTipo = 'guardar';
    this.modalTitulo = this.editandoId ? 'Confirmar Edición' : 'Crear Equipo';
    this.modalMensaje = this.editandoId
      ? `¿Estás seguro de que deseas editar a ${this.formData.nombre}?`
      : `¿Crear nuevo equipo: ${this.formData.nombre}?`;
    this.modalAccionConfirmar = () => this.confirmarGuardar();
    this.modalVisible = true;
  }

  private confirmarGuardar(): void {
    this.enviandoModal = true;
    this.error = 'La funcionalidad de actualizar requiere endpoints en el backend';
    this.enviandoModal = false;
    this.cerrarModal();
    this.cdr.detectChanges();
  }

  eliminarEquipo(id: string, nombre: string): void {
    this.equipoSeleccionado = { id, nombre };
    this.modalTipo = 'eliminar';
    this.modalTitulo = 'Eliminar Equipo';
    this.modalMensaje = `¿Estás seguro de que deseas eliminar a <strong>${nombre}</strong>? Esta acción no se puede deshacer.`;
    this.modalAccionConfirmar = () => this.confirmarEliminar();
    this.modalVisible = true;
  }

  private confirmarEliminar(): void {
    this.enviandoModal = true;
    this.error = 'La funcionalidad de eliminar requiere endpoints en el backend';
    this.enviandoModal = false;
    this.cerrarModal();
    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.modalAccionConfirmar = null;
    this.equipoSeleccionado = null;
    this.cdr.detectChanges();
  }

  resetForm(): void {
    this.editandoId = null;
    this.formData = {
      id: '',
      nombre: '',
      ciudad: '',
      estadio: '',
      capacidad: 0,
      escudo: ''
    };
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.equiposFiltrados = [...this.equipos];
    this.totalRecords = this.equipos.length;
    this.first = 0;
    this.cdr.detectChanges();
  }

  confirmarAccion(): void {
    if (this.modalAccionConfirmar) {
      this.modalAccionConfirmar();
    }
  }

  getEquiposPaginados(): any[] {
    const inicio = this.first;
    const fin = inicio + this.rows;
    return this.equiposFiltrados.slice(inicio, fin);
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
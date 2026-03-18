import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamsService } from '../../services/teams.service';

@Component({
  selector: 'app-admin-equipos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './AdminEquiposComponent.html',
  styleUrls: ['./AdminEquiposComponent.css']
})
export class AdminEquiposComponent implements OnInit {

  equipos: any[] = [];
  cargando = false;
  error: string | null = null;

  // FORM
  mostrarForm = false;
  editandoId: string | null = null;
  formData = {
    id: '',
    nombre: '',
    estadio: '',
    ciudad: '',
    capacidad: 0,
    escudo: ''
  };

  // BÚSQUEDA Y FILTRADO
  busqueda = '';
  equiposFiltrados: any[] = [];

  constructor(
    private teamsService: TeamsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarEquipos();
  }

  cargarEquipos(): void {
    this.cargando = true;
    this.error = null;
    this.teamsService.getAllTeams().subscribe({
      next: (data) => {
        this.equipos = data || [];
        this.equiposFiltrados = [...this.equipos];
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
    if (this.busqueda.trim()) {
      const busquedaLower = this.busqueda.toLowerCase();
      this.equiposFiltrados = this.equipos.filter(e =>
        e.nombre?.toLowerCase().includes(busquedaLower) ||
        e.ciudad?.toLowerCase().includes(busquedaLower) ||
        e.estadio?.toLowerCase().includes(busquedaLower)
      );
    } else {
      this.equiposFiltrados = [...this.equipos];
    }
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

  editarEquipo(equipo: any): void {
    this.editandoId = equipo.id;
    this.formData = { ...equipo };
    this.mostrarForm = true;
  }

  guardarEquipo(): void {
    if (!this.formData.nombre || !this.formData.estadio) {
      this.error = 'Nombre y estadio son obligatorios';
      return;
    }

    this.error = 'La funcionalidad de actualizar requiere endpoints en el backend';
    this.cdr.detectChanges();
  }

  eliminarEquipo(id: string): void {
    if (!confirm('¿Eliminar este equipo?')) return;
    
    this.error = 'La funcionalidad de eliminar requiere endpoints en el backend';
    this.cdr.detectChanges();
  }

  resetForm(): void {
    this.editandoId = null;
    this.formData = {
      id: '',
      nombre: '',
      estadio: '',
      ciudad: '',
      capacidad: 0,
      escudo: ''
    };
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.equiposFiltrados = [...this.equipos];
    this.cdr.detectChanges();
  }

}
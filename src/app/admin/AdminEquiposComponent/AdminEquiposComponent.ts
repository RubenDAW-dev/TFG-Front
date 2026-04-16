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
  templateUrl: './AdminEquiposComponent.html',
  styleUrls: ['./AdminEquiposComponent.css']
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
  selectedCity = '';
  cities: string[] = [];

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
        this.cities = Array.from(new Set(
          this.equipos
            .map(e => e.ciudad)
            .filter((c: string | null | undefined) => !!c)
        )).sort((a, b) => a.localeCompare(b));
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

    if (this.selectedCity) {
      resultado = resultado.filter(e => e.ciudad === this.selectedCity);
    }

    this.equiposFiltrados = resultado;
    this.cdr.detectChanges();
  }

  onBusquedaChange(): void {
    this.aplicarFiltros();
  }

  onCityChange(): void {
    this.aplicarFiltros();
  }

  getEscudoEquipo(equipo: any): string {
    return equipo?.escudo || equipo?.imagenUrl || '';
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

  if (!this.editandoId) {
    this.error = "Solo existe la funcionalidad de actualizar. No se permite crear equipos.";
    return;
  }

  const payload = {
    nombre: this.formData.nombre.trim(),
    ciudad: this.formData.ciudad.trim(),
    estadio: this.formData.estadio.trim(),
    capacidad: this.formData.capacidad,
    escudo: this.formData.escudo?.trim()
  };

  this.equiposService.updateTeam(this.editandoId, payload).subscribe({
    next: () => {
      this.error = null;
      this.mostrarForm = false;
      this.resetForm();
      this.cargarEquipos();
      this.cdr.detectChanges();
    },
    error: (err) => {
      this.error = err.error?.message || 'Error al actualizar equipo';
      this.cdr.detectChanges();
    }
  });
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
    this.selectedCity = '';
    this.equiposFiltrados = [...this.equipos];
    this.cdr.detectChanges();
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
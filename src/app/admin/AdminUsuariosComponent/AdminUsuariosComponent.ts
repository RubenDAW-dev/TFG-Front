import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './AdminUsuariosComponent.html',
  styleUrls: ['./AdminUsuariosComponent.css']
})
export class AdminUsuariosComponent implements OnInit {

  usuarios: any[] = [];
  cargando = false;
  error: string | null = null;
  mensajeExito: string | null = null;

  // BÚSQUEDA Y FILTRADO
  busqueda = '';
  filtroRol = '';
  usuariosFiltrados: any[] = [];

  // EDICIÓN
  editandoId: number | null = null;
  editandoRol: number = 0;

  constructor(
    private usuariosService: UsuariosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.error = null;
    this.usuariosService.listar().subscribe({
      next: (data) => {
        this.usuarios = data || [];
        this.usuariosFiltrados = [...this.usuarios];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar usuarios';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.usuarios];

    if (this.busqueda.trim()) {
      const busquedaLower = this.busqueda.toLowerCase();
      resultado = resultado.filter(u =>
        u.nombre?.toLowerCase().includes(busquedaLower) ||
        u.email?.toLowerCase().includes(busquedaLower)
      );
    }

    if (this.filtroRol) {
      resultado = resultado.filter(u => u.rol === parseInt(this.filtroRol));
    }

    this.usuariosFiltrados = resultado;
    this.cdr.detectChanges();
  }

  onBusquedaChange(): void {
    this.aplicarFiltros();
  }

  onFiltroRolChange(): void {
    this.aplicarFiltros();
  }

  iniciarEdicionRol(usuario: any): void {
    this.editandoId = usuario.id;
    this.editandoRol = usuario.rol;
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.editandoRol = 0;
  }

  guardarRol(usuarioId: number): void {
    this.usuariosService.cambiarRol(usuarioId, this.editandoRol).subscribe({
      next: () => {
        this.mensajeExito = 'Rol actualizado correctamente';
        this.editandoId = null;
        this.cargarUsuarios();
        setTimeout(() => {
          this.mensajeExito = null;
          this.cdr.detectChanges();
        }, 3000);
      },
      error: () => {
        this.error = 'Error al cambiar el rol';
        this.cdr.detectChanges();
      }
    });
  }

  eliminarUsuario(id: number, nombre: string): void {
    if (!confirm(`¿Eliminar a ${nombre}?`)) return;

    this.usuariosService.eliminar(id).subscribe({
      next: () => {
        this.mensajeExito = 'Usuario eliminado correctamente';
        this.cargarUsuarios();
        setTimeout(() => {
          this.mensajeExito = null;
          this.cdr.detectChanges();
        }, 3000);
      },
      error: () => {
        this.error = 'Error al eliminar usuario';
        this.cdr.detectChanges();
      }
    });
  }

  getRolNombre(rol: number): string {
    return rol === 1 ? 'Administrador' : 'Usuario';
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroRol = '';
    this.usuariosFiltrados = [...this.usuarios];
    this.cdr.detectChanges();
  }

}
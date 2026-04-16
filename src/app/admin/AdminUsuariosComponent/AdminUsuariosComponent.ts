import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-admin-usuarios',
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
  templateUrl: './AdminUsuariosComponent.html',
  styleUrls: ['./AdminUsuariosComponent.css']
})
export class AdminUsuariosComponent implements OnInit {

  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  cargando = false;
  error: string | null = null;

  // BÚSQUEDA Y FILTRADO
  busqueda = '';
  filtroRol = '';

  // PAGINACIÓN
  totalRecords = 0;
  rows = 20;
  first = 0;
  pagina = 1;

  // MODAL CREAR USUARIO
  mostrarModalCrear = false;
  crearUsuarioForm = {
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  crearUsuarioError: string | null = null;

  // MODAL CAMBIAR ROL
  mostrarModalRol = false;
  usuarioSeleccionado: any = null;
  nuevoRol: number = 0;

  // MODAL RESET PASSWORD
  mostrarModalPassword = false;
  passwordNueva = '';
  passwordConfirm = '';
  passwordError: string | null = null;

  // MODAL CONFIRMACIÓN (SOLO PARA ELIMINAR)
  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  modalAccionConfirmar: (() => void) | null = null;
  enviandoModal = false;

  constructor(
    private usuariosService: UsuariosService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  // ====================================
  // CARGAR DATOS
  // ====================================
  cargarUsuarios(): void {
    this.cargando = true;
    this.error = null;
    this.usuariosService.listar().subscribe({
      next: (data) => {
        // Asegurar que es un array
        this.usuarios = Array.isArray(data) ? data : [];
        
        // Debug: Verificar que los datos llegaron bien
        console.log('Usuarios cargados:', this.usuarios);
        
        this.totalRecords = this.usuarios.length;
        this.aplicarFiltros();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
        this.error = 'Error al cargar usuarios';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ====================================
  // FILTROS Y BÚSQUEDA
  // ====================================
  aplicarFiltros(): void {
    let resultado = [...this.usuarios];

    if (this.busqueda.trim()) {
      const busquedaLower = this.busqueda.toLowerCase();
      resultado = resultado.filter(u =>
        u.nombre?.toLowerCase().includes(busquedaLower) ||
        u.email?.toLowerCase().includes(busquedaLower)
      );
    }

    if (this.filtroRol !== '') {
      const rolNum = parseInt(this.filtroRol);
      resultado = resultado.filter(u => u.rol === rolNum);
    }

    this.usuariosFiltrados = resultado;
    this.totalRecords = resultado.length;
    this.first = 0;
    this.cdr.detectChanges();
  }

  onBusquedaChange(): void {
    this.aplicarFiltros();
  }

  onFiltroRolChange(): void {
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroRol = '';
    this.usuariosFiltrados = [...this.usuarios];
    this.totalRecords = this.usuarios.length;
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

  getUsuariosPaginados(): any[] {
    const inicio = this.first;
    const fin = inicio + this.rows;
    return this.usuariosFiltrados.slice(inicio, fin);
  }

  // ====================================
  // UTILIDADES
  // ====================================
  getRolNombre(rol: number): string {
    return rol === 1 ? 'ADMINISTRADOR' : 'USUARIO';
  }

  // ====================================
  // MODAL CREAR USUARIO
  // ====================================
  abrirModalCrear(): void {
    this.crearUsuarioForm = {
      nombre: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    this.crearUsuarioError = null;
    this.mostrarModalCrear = true;
    this.cdr.detectChanges();
  }

  guardarNuevoUsuario(): void {
    this.crearUsuarioError = null;

    const nombre = this.crearUsuarioForm.nombre.trim();
    const email = this.crearUsuarioForm.email.trim();
    const password = this.crearUsuarioForm.password;
    const confirmPassword = this.crearUsuarioForm.confirmPassword;

    if (!nombre || !email || !password || !confirmPassword) {
      this.crearUsuarioError = 'Completa todos los campos.';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.crearUsuarioError = 'El email no tiene un formato válido.';
      return;
    }

    if (password.length < 6) {
      this.crearUsuarioError = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    if (password !== confirmPassword) {
      this.crearUsuarioError = 'Las contraseñas no coinciden.';
      return;
    }

    this.enviandoModal = true;
    this.usuariosService.crear({ nombre, email, password }).subscribe({
      next: () => {
        this.enviandoModal = false;
        this.cerrarModalCrear();
        // Diferir la carga de usuarios al siguiente ciclo de eventos
        // para evitar ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => this.cargarUsuarios(), 0);
      },
      error: (err) => {
        this.enviandoModal = false;
        if (err?.status === 409) {
          this.crearUsuarioError = 'El correo ya está registrado.';
        } else {
          this.crearUsuarioError = 'No se pudo crear el usuario. Inténtalo de nuevo.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  cerrarModalCrear(): void {
    this.mostrarModalCrear = false;
    this.crearUsuarioError = null;
    this.crearUsuarioForm = {
      nombre: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    this.cdr.detectChanges();
  }

  // ====================================
  // MODAL CAMBIAR ROL (SIN CONFIRMACIÓN EXTRA)
  // ====================================
  abrirModalRol(usuario: any): void {
    this.usuarioSeleccionado = usuario;
    this.nuevoRol = usuario.rol;
    this.mostrarModalRol = true;
  }

  guardarRol(): void {
    if (!this.usuarioSeleccionado) return;

    // Validar que cambió el rol
    if (this.nuevoRol === this.usuarioSeleccionado.rol) {
      this.error = 'Selecciona un rol diferente';
      return;
    }

    this.enviandoModal = true;
    this.error = null;

    // DTO que espera el endpoint: nombre, email, rol
    const updateDTO = {
      nombre: this.usuarioSeleccionado.nombre,
      email: this.usuarioSeleccionado.email,
      rol: this.nuevoRol
    };

    this.usuariosService.actualizar(this.usuarioSeleccionado.id, updateDTO).subscribe({
      next: (response) => {
        // Actualizar en el array local con la respuesta del servidor
        const index = this.usuarios.findIndex(u => u.id === this.usuarioSeleccionado.id);
        if (index !== -1) {
          this.usuarios[index] = response;  // Usar la respuesta completa del servidor
        }
        
        // Aplicar filtros para actualizar la vista
        this.aplicarFiltros();
        
        // Cerrar modal y limpiar
        this.enviandoModal = false;
        this.cerrarModalRol();
        
        // Forzar detección de cambios
        this.cdr.detectChanges();
        
        console.log('Rol actualizado correctamente:', response);
      },
      error: (err) => {
        console.error('Error al cambiar rol:', err);
        this.error = 'Error al cambiar el rol del usuario. Intenta de nuevo.';
        this.enviandoModal = false;
        this.cdr.detectChanges();
      }
    });
  }

  cerrarModalRol(): void {
    this.mostrarModalRol = false;
    this.usuarioSeleccionado = null;
    this.nuevoRol = 0;
    this.error = null;
    this.cdr.detectChanges();
  }

  abrirModalPassword(usuario: any): void {
    this.usuarioSeleccionado = usuario;
    this.passwordNueva = '';
    this.passwordConfirm = '';
    this.passwordError = null;
    this.mostrarModalPassword = true;
    this.cdr.detectChanges();
  }

  guardarPassword(): void {
    if (!this.usuarioSeleccionado) return;

    this.passwordError = null;

    if (!this.passwordNueva || !this.passwordConfirm) {
      this.passwordError = 'Debes completar ambos campos de contraseña.';
      return;
    }

    if (this.passwordNueva !== this.passwordConfirm) {
      this.passwordError = 'Las contraseñas no coinciden.';
      return;
    }

    if (this.passwordNueva.length < 6) {
      this.passwordError = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    this.enviandoModal = true;
    this.usuariosService.resetPassword(this.usuarioSeleccionado.id, this.passwordNueva).subscribe({
      next: () => {
        this.enviandoModal = false;
        this.cerrarModalPassword();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al resetear contraseña:', err);
        this.passwordError = 'Error al resetear la contraseña. Intenta de nuevo.';
        this.enviandoModal = false;
        this.cdr.detectChanges();
      }
    });
  }

  cerrarModalPassword(): void {
    this.mostrarModalPassword = false;
    this.passwordNueva = '';
    this.passwordConfirm = '';
    this.passwordError = null;
    this.usuarioSeleccionado = null;
    this.cdr.detectChanges();
  }

  // ====================================
  // ELIMINAR (CON MODAL DE CONFIRMACIÓN)
  // ====================================
  eliminarUsuario(id: number, nombre: string): void {
    this.usuarioSeleccionado = { id, nombre };
    this.modalTitulo = 'Eliminar Usuario';
    this.modalMensaje = `¿Estás seguro de que deseas eliminar a <strong>${nombre}</strong>? Esta acción no se puede deshacer.`;
    this.modalAccionConfirmar = () => this.confirmarEliminar();
    this.modalVisible = true;
  }

  private confirmarEliminar(): void {
    this.enviandoModal = true;

    this.usuariosService.eliminar(this.usuarioSeleccionado.id).subscribe({
      next: () => {
        // Eliminar del array local
        this.usuarios = this.usuarios.filter(u => u.id !== this.usuarioSeleccionado.id);
        this.aplicarFiltros();
        this.error = null;
        this.enviandoModal = false;
        this.cerrarModal();
      },
      error: () => {
        this.error = 'Error al eliminar el usuario';
        this.enviandoModal = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ====================================
  // MODAL CONFIRMACIÓN (SOLO ELIMINAR)
  // ====================================
  cerrarModal(): void {
    this.modalVisible = false;
    this.modalAccionConfirmar = null;
    this.usuarioSeleccionado = null;
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
    this.crearUsuarioError = null;
    this.passwordError = null;
    this.cdr.detectChanges();
  }
}
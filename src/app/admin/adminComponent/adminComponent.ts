import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/Auth/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './adminComponent.html',
  styleUrls: ['./adminComponent.css']
})
export class adminComponent implements OnInit {
 
  // CONTROL DE ACCESO
  tieneAcceso = false;
  currentRoute = 'jugadores';
 
  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}
 
  ngOnInit(): void {
    this.validarAcceso();
    this.detectarRutaActual();
  }
 
  validarAcceso(): void {
    // Solo admin puede acceder
    if (!this.authService.isAdmin()) {
      this.tieneAcceso = false;
      this.router.navigate(['/home']);
      this.cdr.detectChanges();
      return;
    }
    this.tieneAcceso = true;
    this.cdr.detectChanges();
  }
 
  detectarRutaActual(): void {
    // Detectar qué tab está activo según la ruta
    this.activatedRoute.firstChild?.params.subscribe(() => {
      const url = this.router.url;
      
      if (url.includes('jugadores')) {
        this.currentRoute = 'jugadores';
      } else if (url.includes('equipos')) {
        this.currentRoute = 'equipos';
      } else if (url.includes('partidos')) {
        this.currentRoute = 'partidos';
      } else if (url.includes('usuarios')) {
        this.currentRoute = 'usuarios';
      } else if (url.includes('comentarios')) {
        this.currentRoute = 'comentarios';
      }
      
      this.cdr.detectChanges();
    });
  }
 
  navigateTo(section: string): void {
    this.currentRoute = section;
    this.router.navigate(['/admin', section]);
    this.cdr.detectChanges();
  }
 
}

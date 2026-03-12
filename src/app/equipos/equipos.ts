import { Component, OnInit, inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Table } from 'primeng/table';

import { TeamSeasonStatsService } from '../services/team-season-stats.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-equipos',
  standalone: true,
  templateUrl: './equipos.html',
  styleUrls: ['./equipos.css'],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    RouterLink
  ]
})
export class Equipos implements OnInit {

  @ViewChild('dt') dt!: Table;

  private service = inject(TeamSeasonStatsService);
  private cdr = inject(ChangeDetectorRef);

  teams: any[] = [];
  loading = true;
  totalRecords = 0;
  currentRows = 20;
  rowOptions = [10, 20, 50];
  activeTab: 'clasificacion' | 'ataque' | 'defensa' | 'medias' = 'clasificacion';

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll() {
  this.loading = true;
  this.service.getStatsTable().subscribe({
    next: (res) => {
      this.teams = res;
      this.totalRecords = res.length;
      this.loading = false;

      setTimeout(() => {
        if (this.dt) {
          this.dt.sortField = 'puntos'; 
          this.dt.sortOrder = -1;       
          this.dt.sortSingle();        
        }
      }, 0);

      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Error completo:', err);
      this.loading = false;
    }
  });
}

  onRowsChange(rows: number) {
    this.currentRows = Number(rows);
    if (this.dt) {
      this.dt.rows = this.currentRows;
      this.dt.first = 0;
      this.dt.reset();
    }
  }
}
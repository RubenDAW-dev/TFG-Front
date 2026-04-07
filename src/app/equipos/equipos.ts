import { Component, OnInit, inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { PopoverModule } from 'primeng/popover';
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
    SelectModule,
    PopoverModule,
    InputTextModule,
    ButtonModule,
    RouterLink
  ]
})
export class Equipos implements OnInit {

  @ViewChild('dt') dt!: Table;

  private service = inject(TeamSeasonStatsService);
  private cdr = inject(ChangeDetectorRef);

  allTeams: any[] = [];
  teams: any[] = [];
  cities: any[] = [];
  selectedCity: string | null = null;
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
        this.allTeams = res;
        this.teams = [...res];
        this.cities = this.getCities(res);
        this.totalRecords = res.length;
        this.loading = false;

        setTimeout(() => {
          if (this.dt) {
            this.dt.sortField = 'puntos';
            this.dt.sortOrder = -1;
            this.dt.sortSingle();
          }
        }, 0);

        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error completo:', err);
        this.loading = false;
      }
    });
  }

  private getCities(teams: any[]): any[] {
    const unique = Array.from(new Set(teams.map(t => t.ciudad).filter(Boolean)));
    return unique.sort().map(ciudad => ({ label: ciudad, value: ciudad }));
  }

  applyFilters() {
    if (!this.selectedCity) {
      this.teams = [...this.allTeams];
    } else {
      this.teams = this.allTeams.filter(t => t.ciudad === this.selectedCity);
    }

    this.totalRecords = this.teams.length;
    if (this.dt) {
      this.dt.first = 0;
      this.dt.reset();
    }
  }

  clearFilters() {
    this.selectedCity = null;
    this.applyFilters();
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
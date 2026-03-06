import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

import { PlayerSeasonStatsService } from '../../services/player-season-stats.service';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-jugadores',
  standalone: true,
  templateUrl: './jugadores.html',
  styleUrls: ['./jugadores.css'],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    SelectModule,
    InputTextModule,
    ButtonModule,
    PopoverModule,
    IconFieldModule,
    InputIconModule
  ]
})
export class Jugadores implements OnInit {

  private service = inject(PlayerSeasonStatsService);
  private cdr = inject(ChangeDetectorRef); // ← AÑADIR

  players: any[] = [];
  teams: any[] = [];
  selectedTeam: string | null = null;
  loading = true;
  totalRecords = 0;

  ngOnInit(): void {
    this.loadAll();
    this.loadTeams();
  }

  loadAll(page = 0, size = 20, sortField = 'goles', sortOrder = -1) {
  this.loading = true;
  const sortDir = sortOrder === 1 ? 'asc' : 'desc';
  this.service.getAll(page, size, sortField, sortDir).subscribe({
    next: (res) => {
      this.players = res.content;
      this.totalRecords = res.page.totalElements;
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}
  loadTeams() {
    this.service.getTeams().subscribe({
      next: (res) => {
        this.teams = res;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters() {
    if (!this.selectedTeam) {
      this.loadAll();
      return;
    }

    this.loading = true;
    this.service.getPlayersByTeam(this.selectedTeam).subscribe({
      next: (page) => {
        this.players = page.content;
        this.loading = false;
        this.cdr.detectChanges();
        console.log('Jugadores filtrados por equipo:', this.players);
      }
    });
  }

  clearFilters() {
    this.selectedTeam = null;
    this.loadAll();
  }
  onLazyLoad(event: any) {
  const page = (event.first ?? 0) / (event.rows ?? 20);
  const size = event.rows ?? 20;
  const sortField = event.sortField ?? 'goles';
  const sortOrder = event.sortOrder ?? -1;
  this.loadAll(page, size, sortField, sortOrder);
}
}
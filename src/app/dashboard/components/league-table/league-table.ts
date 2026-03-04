import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-league-table',
  templateUrl: './league-table.html',
  styleUrls: ['./league-table.css'],
  standalone: true,
  imports: [CommonModule, TableModule]
})
export class LeagueTableComponent {
  @Input() table: any[] = [];
}
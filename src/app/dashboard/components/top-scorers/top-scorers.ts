import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-top-scorers',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './top-scorers.html',
  styleUrl: './top-scorers.css'
})
export class TopScorers { 

  @Input() players: any[] = [];
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-top-scorers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-scorers.html',
  styleUrl: './top-scorers.css'
})
export class TopScorers { 

  @Input() players: any[] = [];
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-top-assits',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './top-assits.html',
  styleUrl: './top-assits.css'
})
export class TopAssits { 

  @Input() players: any[] = [];
}

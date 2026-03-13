import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FutureMatchDTO } from '../../../shared/models/future-match.dto';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';



@Component({
  selector: 'app-next-matches',
  imports: [CommonModule,RouterLink],
  templateUrl: './next-matches.html',
  styleUrl: './next-matches.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NextMatches {
  
  @Input() matches: FutureMatchDTO[] = [];

 }

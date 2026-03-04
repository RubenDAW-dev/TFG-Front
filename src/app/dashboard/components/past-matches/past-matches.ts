import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PastMatchDTO } from '../../../shared/models/past-match.dto';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-past-matches',
  imports: [CommonModule],
  templateUrl: './past-matches.html',
  styleUrl: './past-matches.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PastMatches { 
  
  @Input() matches: PastMatchDTO[] = [];

}

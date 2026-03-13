import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PastMatchDTO } from '../../../shared/models/past-match.dto';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-past-matches',
  imports: [CommonModule, RouterModule],
  templateUrl: './past-matches.html',
  styleUrl: './past-matches.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PastMatches {
  @Input() matches: PastMatchDTO[] = [];

  getResultClass(match: PastMatchDTO) {
    if (!match.score) return '';
    const [g1, g2] = match.score.split('-').map(n => parseInt(n.trim(), 10));
    if (g1 > g2) return 'win';
    if (g1 < g2) return 'loss';
    return 'draw';
  }
}
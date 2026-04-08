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

  formatDay(dayStr: string): string {
    const dayMap: Record<string, string> = {
      mon: 'lun',
      tue: 'mar',
      wed: 'mié',
      thu: 'jue',
      fri: 'vie',
      sat: 'sáb',
      sun: 'dom',
      monday: 'lunes',
      tuesday: 'martes',
      wednesday: 'miércoles',
      thursday: 'jueves',
      friday: 'viernes',
      saturday: 'sábado',
      sunday: 'domingo'
    };

    if (!dayStr) return '';

    const normalized = dayStr.trim().toLowerCase();
    if (dayMap[normalized]) {
      return dayMap[normalized];
    }

    const date = new Date(dayStr + 'T00:00:00');
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    }

    return dayStr;
  }
 }

// team-match-stats.entity.ts
import { MatchEntity, TeamEntity } from './match.entity';

export interface TeamMatchStatsEntity {
  id: number;
  match: MatchEntity;
  team: TeamEntity;
  side: string;
  possession?: number | null;
  shots_on_target?: number | null;
  shots_total?: number | null;
  saves?: number | null;
  cards?: number | null;
}
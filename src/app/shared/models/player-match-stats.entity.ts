// player-match-stats.entity.ts
import { MatchEntity } from './match.entity';

export interface PlayerEntity {
  id: string;
  nombre: string;
  team?: { id: string };
}

export interface PlayerMatchStatsEntity {
  idInterno: number;
  match: MatchEntity;
  player: PlayerEntity;
  number?: number | null;
  nation?: string | null;
  pos?: string | null;
  age?: string | null;
  minutes?: number | null;
  gls?: number | null;
  ast?: number | null;
  pk?: number | null;
  pkAtt?: number | null;
  shots?: number | null;
  shotsOnTarget?: number | null;
  yellowCards?: number | null;
  redCards?: number | null;
  foulsCommitted?: number | null;
  foulsDrawn?: number | null;
  offsides?: number | null;
  crosses?: number | null;
  tacklesWon?: number | null;
  interceptions?: number | null;
  ownGoals?: number | null;
}
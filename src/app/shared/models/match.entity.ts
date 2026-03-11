export interface TeamEntity {
  id: string;
  nombre: string;
  estadio: string;
  ciudad: string;
  capacidad: number;
}

export interface MatchEntity {
  id: number;
  homeTeam: TeamEntity;
  awayTeam: TeamEntity;
  wk: number;
  day: string;
  date: string;
  time: string;
  score: string | null;
  attendance: number;
  venue: string;
  referee: string;
}
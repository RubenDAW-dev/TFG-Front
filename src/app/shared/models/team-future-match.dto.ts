export interface TeamFutureMatchDTO {
  id: number;
  homeTeamId: string;
  homeTeam: string;
  awayTeamId: string;
  awayTeam: string;
  day: string;
  time: string;
  venue: string;
  wk: number;
  date: string; // "yyyy-MM-dd"
}
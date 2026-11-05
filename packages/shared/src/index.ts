export type DataSource = 'demo' | 'postgres';

export interface PlayerStats {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  games: number;
  minutes: number;
  points: number;
  pointsPerGame: number;
  reboundsPerGame: number;
  assistsPerGame: number;
  threesPerGame: number;
  fieldGoalPct: number | null;
  effectiveFieldGoalPct: number | null;
  trueShootingPct: number | null;
  usagePct: number | null;
}

export interface TeamStats {
  id: string;
  name: string;
  games: number;
  wins: number;
  losses: number;
  pointsPerGame: number | null;
  allowedPointsPerGame: number | null;
  offensiveRating: number | null;
  defensiveRating: number | null;
  netRating: number | null;
  effectiveFieldGoalPct: number | null;
  offensiveReboundPct: number | null;
}

export interface GameStats {
  id: string;
  date: string | null;
  round: string | null;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'scheduled' | 'final';
}

export interface LeagueData {
  source: DataSource;
  season: string;
  updatedAt: string;
  players: PlayerStats[];
  teams: TeamStats[];
  games: GameStats[];
  warnings: string[];
}

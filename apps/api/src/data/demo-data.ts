import type { GameStats, LeagueData, PlayerStats, TeamStats } from '@45cut/shared';

// Intentionally synthetic data: these figures are not official FEB statistics.
const teamNames = [
  'Fuenlabrada', 'Menorca', 'Alicante', 'Cantabria', 'Oviedo',
  'Gran Canaria', 'Caja 87', 'Palencia', 'Estudiantes',
];

const teams: TeamStats[] = teamNames.map((name, i) => {
  const offense = 111.3 + (i % 5) * 2.4 - i * 0.7;
  const defense = 108.2 + (i % 4) * 3.3;
  return {
    id: `demo-team-${i + 1}`, name, games: 8, wins: 7 - (i % 6), losses: 1 + (i % 6),
    pointsPerGame: Number((83 + i * 1.1).toFixed(1)),
    allowedPointsPerGame: Number((78 + i * 1.45).toFixed(1)),
    offensiveRating: Number(offense.toFixed(1)),
    defensiveRating: Number(defense.toFixed(1)),
    netRating: Number((offense - defense).toFixed(1)),
    effectiveFieldGoalPct: Number((49 + i * 0.9).toFixed(1)),
    offensiveReboundPct: Number((27 + i * 0.8).toFixed(1)),
  };
});

const firstNames = ['Alex', 'Lucas', 'Hugo', 'Daniel', 'Mario', 'Leo', 'Nico', 'Pablo', 'Sergio', 'Adrián', 'Iván', 'Bruno', 'David', 'Raúl', 'Eric', 'Marco', 'Óscar', 'Joel'];
const lastNames = ['Example', 'Sample', 'Demo'];
const players: PlayerStats[] = Array.from({ length: 36 }, (_, i) => {
  const team = teams[i % teams.length];
  const games = 7 + (i % 2);
  const pointsPerGame = Number((20.2 - i * 0.34).toFixed(1));
  return {
    id: `demo-player-${i + 1}`, name: `${firstNames[i % firstNames.length]} ${lastNames[Math.floor(i / 12)]}`,
    teamId: team.id, teamName: team.name, games,
    minutes: Number((30.4 - i * 0.37).toFixed(1)),
    points: Math.round(pointsPerGame * games), pointsPerGame,
    reboundsPerGame: Number((3.2 + (i % 8) * 0.67).toFixed(1)),
    assistsPerGame: Number((1.4 + (i % 7) * 0.53).toFixed(1)),
    threesPerGame: Number((0.6 + (i % 5) * 0.36).toFixed(1)),
    fieldGoalPct: Number((40.4 + (i % 9) * 1.65).toFixed(1)),
    effectiveFieldGoalPct: Number((45.9 + (i % 9) * 1.5).toFixed(1)),
    trueShootingPct: Number((50.7 + (i % 9) * 1.4).toFixed(1)),
    usagePct: Number((17 + (i % 8) * 1.7).toFixed(1)),
  };
});

const games: GameStats[] = Array.from({ length: 12 }, (_, i) => ({
  id: `demo-game-${i + 1}`, date: `2026-10-${String(11 + i).padStart(2, '0')}`,
  round: `Round ${Math.floor(i / 3) + 1}`,
  homeTeam: teams[i % teams.length].name,
  awayTeam: teams[(i + 3) % teams.length].name,
  homeScore: i < 9 ? 72 + i * 2 : null,
  awayScore: i < 9 ? 79 + (i % 4) * 3 : null,
  status: i < 9 ? 'final' : 'scheduled',
}));

export function createDemoData(season: string): LeagueData {
  return {
    source: 'demo', season, updatedAt: new Date().toISOString(),
    players, teams, games,
    warnings: ['Datos de ejemplo: nombres y estadísticas de jugadores ficticios. Conecta PostgreSQL para utilizar datos reales.'],
  };
}

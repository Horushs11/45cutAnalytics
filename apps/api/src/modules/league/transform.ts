
import type {
  GameStats,
  PlayerStats,
  TeamStats
} from '@45cut/shared';

import {
  num,
  pct,
  round,
  text,
  value,
  asNumber,
  type DatabaseRow
} from '../../utils/columns.js';

const perGame = (value: number, games: number) =>
  games > 0 ? value / games : null;

// PLAYER SEASON STATISTICS
export function normalizePlayers(rows: DatabaseRow[]): PlayerStats[] {
  return rows.flatMap(row => {
    const id = text(row, 'player_id');
    const name = text(row, 'player_name');

    if (!id || !name) return [];

    const games = num(row, 'games') ?? 0;

    return [{
      id,
      name,
      teamId: text(row, 'team_id'),
      teamName: text(row, 'team'),
      games,
      minutes: round(num(row, 'minutes_pg')) ?? 0,
      points: num(row, 'pts') ?? 0,
      pointsPerGame: round(num(row, 'pts_pg')) ?? 0,
      reboundsPerGame: round(num(row, 'reb_pg')) ?? 0,
      assistsPerGame: round(num(row, 'ast_pg')) ?? 0,
      threesPerGame: round(
        perGame(num(row, 'threepm') ?? 0, games)
      ) ?? 0,
      fieldGoalPct: pct(num(row, 'fg_pct')),
      effectiveFieldGoalPct: pct(num(row, 'efg_pct')),
      trueShootingPct: pct(num(row, 'ts_pct')),
      usagePct: pct(num(row, 'usg_pct'))
    }];
  }).sort((a, b) => b.pointsPerGame - a.pointsPerGame);
}

// TEAM SEASON STATISTICS
export function normalizeTeams(rows: DatabaseRow[]): TeamStats[] {
  return rows.flatMap(row => {
    const id = text(row, 'team_id');
    const name = text(row, 'team');

    if (!id || !name) return [];

    return [{
      id,
      name,
      games: num(row, 'games') ?? 0,
      wins: num(row, 'wins') ?? 0,
      losses: num(row, 'losses') ?? 0,
      pointsPerGame: round(num(row, 'pts_pg')),
      allowedPointsPerGame: round(num(row, 'opp_pts_pg')),
      offensiveRating: round(num(row, 'ortg')),
      defensiveRating: round(num(row, 'drtg')),
      netRating: round(num(row, 'net_rating')),
      effectiveFieldGoalPct: pct(num(row, 'efg_pct')),
      offensiveReboundPct: pct(num(row, 'orb_pct'))
    }];
  });
}

// MATCH RESULTS
const homeValues = new Set(['home', 'h', 'local', 'l', 'casa', 'loc']);
const awayValues = new Set(['away', 'a', 'visitor', 'visitante', 'v', 'fuera', 'vis']);

export function normalizeGames(rows: DatabaseRow[]): GameStats[] {
  const grouped = new Map<string, DatabaseRow[]>();

  for (const row of rows) {
    const id = text(row, 'game_id');
    if (!id) continue;
    grouped.set(id, [...(grouped.get(id) ?? []), row]);
  }

  return [...grouped].flatMap(([gameId, sides]) => {
    const home = sides.find(row =>
      homeValues.has(text(row, 'home_away').toLowerCase().trim())
    );
    const away = sides.find(row =>
      awayValues.has(text(row, 'home_away').toLowerCase().trim())
    );

    if (!home || !away) return [];

    const homeTeam = text(home, 'team');
    const awayTeam = text(away, 'team');
    if (!homeTeam || !awayTeam) return [];

    const rawDate = value(home, 'date');
    const date = rawDate instanceof Date
      ? rawDate.toISOString().slice(0, 10)
      : rawDate == null ? null : String(rawDate).slice(0, 10);

    const homeScore = asNumber(value(home, 'pts'));
    const awayScore = asNumber(value(away, 'pts'));

    return [{
      id: gameId,
      date,
      round: text(home, 'round') || null,
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      status: 'final' as const
    }];
  }).sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
}

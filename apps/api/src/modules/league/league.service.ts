import type { LeagueData } from '@45cut/shared';
import { environment } from '../../config/environment.js';
import { createDemoData } from '../../data/demo-data.js';
import { readTable } from '../../db/pool.js';
import { normalizeGames, normalizePlayers, normalizeTeams } from './transform.js';

async function optionalTable(name: string, warnings: string[]) {
  try {
    return await readTable(name);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    warnings.push(`${name}: ${message}`);
    return [];
  }
}

export async function loadLeagueData(): Promise<LeagueData> {
  if (environment.source === 'demo') return createDemoData(environment.season);
  const warnings: string[] = [];
  const [playerRows, teamRows, gameRows] =
  await Promise.all([
    optionalTable('player_season', warnings),
    optionalTable('team_season', warnings),
    optionalTable('team_game', warnings),
  ]);
  const players = normalizePlayers(playerRows);
  const teams = normalizeTeams(teamRows);
  const games = normalizeGames(gameRows);
  if (playerRows.length > 0 && players.length === 0) warnings.push('Player records found but no player name column matched; check docs/DATABASE.md.');
  if (teamRows.length > 0 && teams.length === 0) warnings.push('Team records found but no team name column matched; check docs/DATABASE.md.');
  if (gameRows.length > 0 && games.length === 0) warnings.push('Game records found but no home/away team name columns matched; check docs/DATABASE.md.');
  if (playerRows.length >= environment.readLimit || teamRows.length >= environment.readLimit || gameRows.length >= environment.readLimit) {
    warnings.push('DB_READ_LIMIT reached. Results may be incomplete; increase the limit or add server-side pagination.');
  }
  return {
    source: 'postgres', season: environment.season, updatedAt: new Date().toISOString(),
    players, teams, games, warnings,
  };
}

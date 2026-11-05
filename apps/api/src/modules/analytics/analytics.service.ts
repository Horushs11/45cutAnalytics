import { environment } from '../../config/environment.js';
import { getPool } from '../../db/pool.js';

export const VIEWS = [
  'player_45cut_score',
  'player_game',
  'player_percentiles',
  'player_radar_metrics',
  'player_season',
  'team_game',
  'team_season',
] as const;
export type AnalyticsView = typeof VIEWS[number];

const identifier = (value: string) => '"' + value.replaceAll('"', '""') + '"';
const schema = identifier(environment.schema);

function requireDatabase() {
  if (environment.source !== 'postgres') {
    throw new Error('Esta sección necesita DATA_SOURCE=postgres.');
  }
  return getPool();
}

export async function getPlayerProfile(playerId: number) {
  const db = requireDatabase();
  const sql = (view: AnalyticsView) =>
    `SELECT * FROM ${schema}.${identifier(view)} WHERE season = $1 AND player_id = $2`;
  const [season, games, percentiles, scores, radar] = await Promise.all([
    db.query(sql('player_season') + ' ORDER BY games DESC LIMIT 1', [environment.season, playerId]),
    db.query(sql('player_game') + ' ORDER BY date, round, game_id', [environment.season, playerId]),
    db.query(sql('player_percentiles') + ' LIMIT 1', [environment.season, playerId]),
    db.query(sql('player_45cut_score') + ' ORDER BY date, round, game_id', [environment.season, playerId]),
    db.query(sql('player_radar_metrics') + ' ORDER BY date, round, metric_order', [environment.season, playerId]),
  ]);
  if (!season.rows.length) return null;
  return {
    season: environment.season,
    player: season.rows[0],
    games: games.rows,
    percentiles: percentiles.rows[0] ?? null,
    scores: scores.rows,
    radar: radar.rows,
  };
}

export async function getTeamProfile(teamId: number) {
  const db = requireDatabase();
  const [season, games] = await Promise.all([
    db.query(
      `SELECT * FROM ${schema}."team_season"
       WHERE season = $1 AND team_id = $2
       LIMIT 1`,
      [environment.season, teamId],
    ),
    db.query(
      `SELECT * FROM ${schema}."team_game"
       WHERE season = $1 AND team_id = $2
       ORDER BY date ASC NULLS LAST, round ASC, game_id ASC`,
      [environment.season, teamId],
    ),
  ]);
  if (!season.rows.length) return null;
  return {
    season: environment.season,
    team: season.rows[0],
    games: games.rows,
  };
}

const searchColumns: Record<AnalyticsView, string[]> = {
  player_45cut_score: ['player_name', 'team', 'opponent'],
  player_game: ['player_name', 'team', 'opponent'],
  player_percentiles: ['player_name', 'team'],
  player_radar_metrics: ['player_name', 'team', 'metric'],
  player_season: ['player_name', 'team'],
  team_game: ['team', 'opponent'],
  team_season: ['team'],
};

export async function exploreView(view: string, options: { offset: number; limit: number; search: string }) {
  if (!VIEWS.includes(view as AnalyticsView)) throw new Error('Vista no permitida');
  const db = requireDatabase();
  const typedView = view as AnalyticsView;
  const filter = options.search
    ? ' AND (' + searchColumns[typedView].map(column => `CAST(${identifier(column)} AS TEXT) ILIKE $2`).join(' OR ') + ')'
    : '';
  const args: unknown[] = [environment.season];
  if (options.search) args.push('%' + options.search + '%');
  const table = `${schema}.${identifier(typedView)}`;
  const where = ' WHERE season = $1' + filter;
  const [count, data] = await Promise.all([
    db.query<{ total: string }>(`SELECT COUNT(*)::text AS total FROM ${table}${where}`, args),
    db.query(`SELECT * FROM ${table}${where} ORDER BY 1, 2 LIMIT $${args.length + 1} OFFSET $${args.length + 2}`,
      [...args, options.limit, options.offset]),
  ]);
  const metadata = await db.query<{ column_name: string }>(
    'SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 ORDER BY ordinal_position',
    [environment.schema, typedView],
  );
  return {
    view: typedView,
    season: environment.season,
    columns: metadata.rows.map(item => item.column_name),
    rows: data.rows,
    total: Number(count.rows[0]?.total ?? 0),
    limit: options.limit,
    offset: options.offset,
  };
}

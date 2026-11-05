import pg from "pg";
import { environment } from "../config/environment.js";

let pool: pg.Pool | undefined;

export function getPool(): pg.Pool {
  if (!environment.databaseUrl) {
    throw new Error(
      "DATA_SOURCE=postgres requires DATABASE_URL in apps/api/.env",
    );
  }

  pool ??= new pg.Pool({
    connectionString: environment.databaseUrl,
    max: 5,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
  });

  return pool;
}

export async function readTable(
  table: string,
): Promise<Record<string, unknown>[]> {
  const allowed = new Set([
    "player_45cut_score",
    "player_game",
    "player_percentiles",
    "player_radar_metrics",
    "player_season",
    "team_game",
    "team_season",
  ]);
  if (!allowed.has(table)) throw new Error("Table not permitted");
  const escapedSchema = `"${environment.schema.replaceAll('"', '""')}"`;
  const escapedTable = `"${table}"`;
  // Only fixed, whitelisted identifiers can be interpolated into this statement.
  const result = await getPool().query<Record<string, unknown>>(
    `SELECT * FROM ${escapedSchema}.${escapedTable}
 WHERE season = $1
 LIMIT $2`,
[environment.season, environment.readLimit],
  );
  return result.rows;
}

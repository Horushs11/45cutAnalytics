import 'dotenv/config';

const dataSource = process.env.DATA_SOURCE === 'postgres' ? 'postgres' : 'demo';
const schema = process.env.DB_SCHEMA ?? 'public';

if (!/^[a-z_][a-z0-9_]*$/i.test(schema)) {
  throw new Error('DB_SCHEMA must be a valid PostgreSQL schema identifier');
}

export const environment = {
  port: Number(process.env.PORT ?? 3001),
  source: dataSource,
  season: process.env.SEASON_LABEL ?? '2026/27',
  databaseUrl: process.env.DATABASE_URL ?? '',
  schema,
  readLimit: Math.min(Math.max(Number(process.env.DB_READ_LIMIT ?? 25000), 1), 100000),
} as const;

export type AnalyticsRow = Record<string, unknown>;

export interface PlayerProfile {
  season: string;
  player: AnalyticsRow;
  games: AnalyticsRow[];
  percentiles: AnalyticsRow | null;
  scores: AnalyticsRow[];
  radar: AnalyticsRow[];
}

export interface ExplorerData {
  view: string;
  season: string;
  columns: string[];
  rows: AnalyticsRow[];
  total: number;
  offset: number;
  limit: number;
}

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(path, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    const json = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(json?.message ?? `Error de API (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export const getPlayerProfile = (id: string) =>
  apiGet<PlayerProfile>(`/api/players/${encodeURIComponent(id)}/profile`);

export const getExplorerData = (view: string, offset: number, search: string, limit = 50) =>
  apiGet<ExplorerData>(`/api/analytics/explorer/${encodeURIComponent(view)}?offset=${offset}&limit=${limit}&search=${encodeURIComponent(search)}`);

export function asNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'number') return value.toLocaleString('es-ES', { maximumFractionDigits: 2 });
  if (typeof value === 'string' && /^-?\d+(?:\.\d+)?$/.test(value)) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed.toLocaleString('es-ES', { maximumFractionDigits: 2 }) : value;
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) return value.slice(0, 10);
  return String(value);
}

export type DatabaseRow = Record<string, unknown>;

export function value(row: DatabaseRow, ...keys: string[]): unknown {
  const columns = Object.fromEntries(Object.entries(row).map(([key, item]) => [key.toLowerCase(), item]));
  for (const key of keys) {
    const item = columns[key.toLowerCase()];
    if (item !== undefined && item !== null && item !== '') return item;
  }
  return null;
}

export function asText(input: unknown, fallback = ''): string {
  return input === null || input === undefined ? fallback : String(input).trim();
}

export function asNumber(input: unknown): number | null {
  if (typeof input === 'number') return Number.isFinite(input) ? input : null;
  if (typeof input === 'string' && /^-?\d{1,3}:\d{1,2}$/.test(input.trim())) {
    const [minutes, seconds] = input.split(':').map(Number);
    return minutes + seconds / 60;
  }
  if (typeof input === 'string' && input.trim() !== '') {
    const parsed = Number(input.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function num(row: DatabaseRow, ...keys: string[]): number | null {
  return asNumber(value(row, ...keys));
}

export function text(row: DatabaseRow, ...keys: string[]): string {
  return asText(value(row, ...keys));
}

export function round(input: number | null | undefined, digits = 1): number | null {
  return input === null || input === undefined || !Number.isFinite(input)
    ? null
    : Number(input.toFixed(digits));
}

export function pct(input: number | null): number | null {
  if (input === null) return null;
  return round(Math.abs(input) <= 1 ? input * 100 : input);
}

export const formatNumber = (value: number | null | undefined, digits = 1): string =>
  value === null || value === undefined || !Number.isFinite(value)
    ? '—'
    : value.toLocaleString('es-ES', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const formatInt = (value: number | null | undefined): string => formatNumber(value, 0);
export const formatPercent = (value: number | null | undefined): string => value == null ? '—' : `${formatNumber(value)}%`;
export const formatSigned = (value: number | null | undefined): string => value == null ? '—' : `${value > 0 ? '+' : ''}${formatNumber(value)}`;
export const initials = (value: string): string => value.split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase() ?? '').join('');
export const toneForValue = (value: number | null | undefined): string => value == null ? 'neutral' : value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral';

import type { LeagueData } from '@45cut/shared';

export async function fetchLeagueData(): Promise<LeagueData> {
  const response = await fetch('/api/league', { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`API error (${response.status}). Comprueba que el servidor está iniciado.`);
  return response.json() as Promise<LeagueData>;
}

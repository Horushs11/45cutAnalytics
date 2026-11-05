import { describe, expect, it } from 'vitest';
import { normalizeGames, normalizePlayers, normalizeTeams } from './transform.js';

describe('Analytics season view normalization', () => {
  it('reads precomputed player season figures without aggregating game logs', () => {
    const players = normalizePlayers([
      { player_id: 1, player_name: 'Demo Guard', team_id: 9, team: 'Home', games: '2', minutes_pg: '20.5', pts: 26, pts_pg: '13', reb_pg: '4', ast_pg: '4', threepm: 3, efg_pct: '0.525', ts_pct: '0.553', usg_pct: '0.225' },
    ]);
    expect(players).toHaveLength(1);
    expect(players[0].pointsPerGame).toBe(13);
    expect(players[0].minutes).toBe(20.5);
    expect(players[0].effectiveFieldGoalPct).toBe(52.5);
    expect(players[0].trueShootingPct).toBe(55.3);
  });

  it('leaves unknown team ratings empty instead of inventing them', () => {
    const [team] = normalizeTeams([{ team_id: 9, team: 'Home', games: 3, pts_pg: 80, opp_pts_pg: 78 }]);
    expect(team.pointsPerGame).toBe(80);
    expect(team.offensiveRating).toBeNull();
    expect(team.defensiveRating).toBeNull();
  });

  it('combines home and away entries of the same match', () => {
    const games = normalizeGames([
      { game_id: 12, round: 2, team: 'Home', home_away: 'home', pts: 82, date: '2026-10-20' },
      { game_id: 12, round: 2, team: 'Away', home_away: 'away', pts: 76, date: '2026-10-20' },
    ]);
    expect(games).toHaveLength(1);
    expect(games[0].homeTeam).toBe('Home');
    expect(games[0].awayScore).toBe(76);
    expect(games[0].status).toBe('final');
  });
});

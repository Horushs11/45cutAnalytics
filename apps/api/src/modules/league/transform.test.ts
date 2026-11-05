import { describe, expect, it } from 'vitest';
import { normalizeGames, normalizePlayers, normalizeTeams } from './transform.js';

describe('PostgreSQL row normalization', () => {
  it('aggregates player games and computes effective FG% and TS%', () => {
    const players = normalizePlayers([
      { player_id: '1', player_name: 'Demo Guard', team_id: '9', team: 'Home', min: '20:30', pts: 14, fgm: 5, fga: 10, threepm: 2, fta: 4, reb: 3, ast: 5 },
      { player_id: '1', player_name: 'Demo Guard', team_id: '9', team: 'Home', min: '19:30', pts: 12, fgm: 4, fga: 10, threepm: 1, fta: 4, reb: 5, ast: 3 },
    ]);
    expect(players).toHaveLength(1);
    expect(players[0].pointsPerGame).toBe(13);
    expect(players[0].minutes).toBe(20);
    expect(players[0].effectiveFieldGoalPct).toBe(52.5);
    expect(players[0].trueShootingPct).toBe(55.3);
  });

  it('retains unknown ratings as null instead of inventing them', () => {
    const [team] = normalizeTeams([{ team: 'Home', games: 3, pts: 240, opp_pts: 234 }]);
    expect(team.pointsPerGame).toBe(80);
    expect(team.offensiveRating).toBeNull();
    expect(team.defensiveRating).toBeNull();
  });

  it('labels unplayed games as scheduled', () => {
    expect(normalizeGames([{ game_id: 1, home_team: 'A', away_team: 'B' }])[0].status).toBe('scheduled');
  });
});

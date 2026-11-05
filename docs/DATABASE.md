# Database integration and metric definitions

The API deliberately reads existing tables without altering them. No migrations, inserts or updates are performed.

## Step 1 — Verify the schema

Run in pgAdmin (replace schema if needed):

```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'games', 'player_game_stats', 'player_advanced_stats', 'team_opponent_totals_live'
  )
ORDER BY table_name, ordinal_position;
```

The app uses `value(...)`, `text(...)` and `num(...)` in `apps/api/src/modules/league/transform.ts` to match common names. If your columns differ, adjust the aliases there. For example, to support `nombre_jugador`, change:

```ts
const name = text(row, 'player_name', 'player', 'name', 'full_name', 'nombre_jugador');
```

**Do not rely on position-only matching.** Use stable `player_id` and `team_id` wherever possible. Transfers can create multiple team-specific player rows by design.

## Data source modes

- `DATA_SOURCE=demo`: shows explicitly labeled synthetic data, needs no PostgreSQL.
- `DATA_SOURCE=postgres`: selects from your local DB. Missing/incorrect source tables generate warnings; no fake values are filled in.

The API reads up to `DB_READ_LIMIT` rows per source table and returns an incompleteness warning when this limit is reached. For larger data sets, switch to paginated SQL and season-specific filtering. The current reader does **not** filter by season; `SEASON_LABEL` is only a display label.

## Metric formulas

### Players

- PPG = `SUM(pts) / games` (game rows counted).
- RPG = `SUM(reb) / games` (or `orb + drb` if `reb` is absent).
- APG = `SUM(ast) / games`.
- FG% = `100 * SUM(fgm) / SUM(fga)`.
- eFG% = `100 * (SUM(fgm) + 0.5 * SUM(threepm)) / SUM(fga)`.
- TS% = `100 * SUM(pts) / (2 * (SUM(fga) + 0.44 * SUM(fta)))`.
- USG% = unweighted average across available `player_advanced_stats` rows matched by the player and team identifiers. **This is an approximation for exploration, not an official season USG%**; exact totals/possession weighting should be wired to your canonical model.

These formulas assume the provided columns contain *per-game totals*, not season cumulative snapshots. If your table records contain cumulative values, replace the player normalization layer before relying on the results.

### Teams

- ORtg = `100 * total team points / team possessions`, if explicit `ortg` or `offensive_rating` isn't present.
- DRtg = `100 * total opponent points / opponent possessions`, if explicit `drtg` or `defensive_rating` isn't present.
- NetRtg = ORtg − DRtg.
- eFG% = `100 * (fgm + 0.5 * threepm) / fga`, if a stored percentage isn't present.
- ORB% = `100 * orb / (orb + opp_drb)`, if a stored percentage isn't present.

Stored percent fields may be in the 0–1 or 0–100 scale; the adapter normalizes either convention. Calculations with missing denominators show `—`.

**Caution:** Team tables with multiple rows per team will produce multiple team entries. The current adapter expects one aggregated row per team/season. Verify its `season` semantics.

### Games

The adapter looks for `home_team`, `away_team`, `home_score`, `away_score`, `game_date` (and a few alternatives). Missing scores indicate scheduled games. If your model uses foreign-key `home_team_id` / `away_team_id`, join your `teams` table in a read-only SQL view and point the adapter at that view.

## Safety

- Database credentials are loaded only by the API from `apps/api/.env` (ignored by Git).
- Both servers bind to `127.0.0.1`.
- SQL table names are selected from a strict allowlist; row limit is parameterized.
- Create a read-only database user for this application when feasible.
- No login/authentication exists because the app is intended for your own local machine; **do not expose the API to the public internet** without adding authentication, access control and rate limiting.

## If a screen is empty

1. Check `http://127.0.0.1:3001/api/health`.
2. Check `http://127.0.0.1:3001/api/league` for `warnings`.
3. Query the PostgreSQL `information_schema.columns` statement above.
4. Correct the aliases in `transform.ts`.
5. Confirm the table rows are for the same season and represent per-game rather than cumulative values.

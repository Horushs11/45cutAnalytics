# Analytics features (development branch)

The player profile is available at `/players/:playerId`. It uses the seven approved PostgreSQL views from the `analytics` schema and the `SEASON_LABEL` value configured locally.

- `/api/players/:id/profile`: player season record, game log, season percentiles, per-game 45CUT scores, per-game radar metrics.
- `/api/analytics/views`: allowed view names.
- `/api/analytics/explorer/:view?offset=0&limit=50&search=`: safe, paginated read-only query to one of the seven views. Limit: 1–200 rows. Search matches textual player/team/opponent/metric columns for the chosen view.

The `/explorer` page lists all PostgreSQL column names, allows toggling displayed fields, searching by name/team, sorting the **current page** and exporting the **current page** as CSV. Filtering and pagination happen on the server; page-level sorting does not globally reorder the full dataset.

Percentile values are read from `player_percentiles`, not recomputed in the frontend. The score chart uses raw `cut_score` values from `player_45cut_score`. The radar intentionally excludes metrics that are absent; its meaning and peer group must be confirmed against the SQL definition.

Do not commit `apps/api/.env` or database credentials. Endpoints are bound to `127.0.0.1` by the existing server and make read-only queries.

To test locally, checkout this branch, run `npm install`, `npm run typecheck`, `npm run test`, and `npm run dev` with your own PostgreSQL credentials in `apps/api/.env`.

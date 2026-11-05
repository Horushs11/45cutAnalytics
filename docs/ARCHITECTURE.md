# Architecture

## Design principles

- **Local-first:** the web server and API run on `127.0.0.1`; no hosting is required.
- **Separated responsibilities:** React is responsible for presenting and filtering data. The API handles database access and normalization.
- **Read-only data access:** the API executes `SELECT` statements only against allowlisted tables.
- **Types are shared:** DTOs live in `packages/shared/src/index.ts`.
- **Predictable UI customization:** change CSS tokens and components without touching database logic.
- **Honest data:** sample numbers are explicitly labeled; missing fields become `null`/`—`, not fabricated statistics.

## Request lifecycle

```text
Browser (React + Vite, 127.0.0.1:5173)
    |
    | GET /api/league (Vite proxy)
    v
Express (127.0.0.1:3001)
    |
    +-- DATA_SOURCE=demo ------> synthetic demo records
    |
    +-- DATA_SOURCE=postgres --> pg Pool --> local PostgreSQL
                                    |
                                    v
                                 fixed SELECTs
                                    |
                                    v
                    league/transform.ts: normalized DTOs
    |
    v
@45cut/shared LeagueData --> React Query --> pages and charts
```

## Future extensions

Split `GET /api/league` into paginated endpoints when the dataset grows substantially. Introduce validated query filters for seasons, teams and players in SQL. Consider materialized views for advanced metrics and a player identity map for transferred players. Add a stable `teams` join for any match rows that only contain IDs. Once you share the exact schema, normalization can be adapted to your canonical database rather than heuristics.

## Design customization map

- `styles/tokens.css`: color palette, surfaces, radius and typography.
- `styles/layout.css`: sidebar, topbar and main content.
- `styles/components.css`: stat cards, charts, buttons, inputs, tables and notices.
- `styles/features.css`: explorer and comparison-specific visuals.
- `styles/responsive.css`: breakpoints and mobile layout.

## Guardrails

Keep `.env` out of GitHub; never put `DATABASE_URL` in `VITE_*` variables. This app does not implement authentication because it is only for local use; expose neither the API nor database ports to public networks.

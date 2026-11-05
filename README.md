# 45CUT Analytics

**Local-first basketball analytics workspace** built with React, TypeScript and PostgreSQL. The application runs on your computer; GitHub is used for source control, not hosting.

> **Data accuracy:** The project starts in `demo` mode with clearly marked synthetic figures. No demo statistic should be presented as real Primera FEB data. The `postgres` mode reads from your existing local database, with configurable column aliases.

## Tech stack

- **Frontend:** React 19, TypeScript, Vite, React Router, TanStack Query, Recharts and plain CSS design tokens.
- **Backend:** Node.js, Express, TypeScript, PostgreSQL (`pg`).
- **Architecture:** npm workspaces (`apps/web`, `apps/api`, `packages/shared`).
- **Deployment:** Not required. Everything runs locally. GitHub can store the repository.

## Requirements

- Node.js 20.19+ (Node 22 recommended)
- npm 10+
- PostgreSQL (optional for the demo; required for real data)

## Start locally

```bash
npm install
cp apps/api/.env.example apps/api/.env
npm run dev
```

Windows PowerShell equivalent:

```powershell
npm install
Copy-Item apps/api/.env.example apps/api/.env
npm run dev
```

Open **http://127.0.0.1:5173**. The API runs on `http://127.0.0.1:3001` and Vite proxies `/api` to the API.

The application does not publish a public service: both development servers listen on the loopback address.

## Connect your existing PostgreSQL database

Edit `apps/api/.env`:

```dotenv
DATA_SOURCE=postgres
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/your_database
DB_SCHEMA=public
SEASON_LABEL=2026/27
```

Make sure PostgreSQL is running and the user can **SELECT** from the source tables. The connection string stays in the API process and is never sent to the browser. Do not commit `.env`.

Expected source tables:

| PostgreSQL table | Used for |
| --- | --- |
| `player_game_stats` | Aggregated player averages, FG%, eFG%, TS% |
| `player_advanced_stats` | USG% if a matching player/team key is available |
| `team_opponent_totals_live` | Team totals, ratings and percentages |
| `games` | Schedules, opponents and scores |

**Important:** Data schemas differ. See [docs/DATABASE.md](docs/DATABASE.md) for column mapping, metric assumptions, known limitations and troubleshooting. If a column is absent, its dependent metric stays empty (`—`) rather than using an invented number.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start API and React app locally |
| `npm run typecheck` | TypeScript checks for both apps |
| `npm run test` | Run API transformation unit tests |
| `npm run build` | Build the React client to `apps/web/dist` |
| `npm run start:api` | Start just the local API |

## Directory structure

```text
apps/
  api/
    src/
      config/                # Environment configuration
      data/                  # Explicitly labeled demo data
      db/                    # PostgreSQL connection and safe reads
      modules/league/        # League normalization, service, tests
      utils/                 # Field/number parsing
  web/
    src/
      app/                   # App routing and loading states
      components/            # Reusable layout, filters, charts, widgets
      features/              # Overview, players, teams, games, compare
      hooks/                 # Query and routing hooks
      lib/                   # API client, formatters, CSV export
      styles/                 # Modular tokens, layout, components, features, responsive CSS
packages/
  shared/src/                # API/frontend contracts
```

## Customize the design

Most colors and spacing are controlled by CSS variables in `apps/web/src/styles/tokens.css` under `:root`. The `global.css` file imports separate layout, component, feature and responsive stylesheets. Components are separated by purpose so you can replace the visual identity without modifying PostgreSQL access or routing.

## Push to a **new** GitHub repository

Create an empty repository named `45cut-analytics` on GitHub and run from this folder:

```bash
git init
git add .
git commit -m "feat: scaffold local 45CUT analytics workspace"
git branch -M main
git remote add origin https://github.com/Horushs11/45cut-analytics.git
git push -u origin main
```

This new repository is preferable to updating your existing `45Cut` repo, which is linked to Vercel. A push to its main branch could trigger an unwanted deployment. No Vercel configuration is included in this project.

## Roadmap

1. Verify actual PostgreSQL column names and game/player identity keys.
2. Add season filters and game-log details based on the verified schema.
3. Add server-side pagination and SQL aggregation if the database grows beyond a few thousand records.
4. Add individual player profiles, richer comparisons and video/scouting notes.

This is a usable, extensible **v1 foundation**, not a production-certified scouting platform. Validate data definitions against the FEB source before publishing analytical conclusions.

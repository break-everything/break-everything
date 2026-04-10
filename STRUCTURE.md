# Project Structure

This project follows Next.js App Router conventions and keeps server-only modules separate from UI code.

## Directory Layout

```text
src/
|-- app/                    # Next.js routes, layouts, pages, API handlers
|   |-- admin/              # Admin dashboard (tools, requests, analytics tab)
|   |-- api/                # HTTP route handlers
|   |   |-- __tests__/      # API integration tests (co-located)
|   |   |-- analytics/      # Admin analytics summary (GET /api/analytics)
|   |   |-- auth/           # Session endpoints
|   |   |-- events/         # Public analytics ingest (POST /api/events)
|   |   |-- requests/       # Tool request endpoints
|   |   `-- tools/          # Tool CRUD endpoints
|   |-- tools/              # Public tool listing, detail, embed/run routes
|   |-- globals.css
|   `-- layout.tsx
|-- analytics/              # Client-only analytics helpers (browser fetch to /api/events)
|   |-- client.ts
|   `-- index.ts
|-- components/
|   |-- admin/              # Admin-only UI (e.g. analytics dashboard panel)
|   |-- forms/
|   |-- layout/
|   |-- tools/
|   `-- index.ts
|-- types/                  # Shared TypeScript types
|   |-- analytics.ts        # AnalyticsSummary (API + admin UI)
|   |-- tool.ts
|   |-- tool-request.ts
|   `-- index.ts
|-- server/
|   |-- analytics-ingest.ts # Rules for POST /api/events (allowed events, action format)
|   |-- api-response.ts
|   |-- auth.ts
|   |-- db.ts               # DB access + recordAnalyticsEvent / getAnalyticsSummary
|   |-- rate-limit.ts       # Includes analyticsIngest bucket
|   |-- validation.ts
|   |-- __tests__/
|   `-- index.ts
`-- test-env.ts             # Jest setup

public/
data/                       # SQLite / local DB files
```

## Analytics (where things live)

| Concern | Location |
|--------|-----------|
| Ingest HTTP API | `src/app/api/events/route.ts` |
| Admin summary HTTP API | `src/app/api/analytics/route.ts` |
| Event name / action validation (server) | `src/server/analytics-ingest.ts` |
| Persist + aggregate queries | `src/server/db.ts` (`recordAnalyticsEvent`, `getAnalyticsSummary`) |
| Shared summary type | `src/types/analytics.ts` |
| Browser tracking helper | `src/analytics/client.ts` (import via `@/analytics`) |
| Admin charts / filters UI | `src/components/admin/AdminAnalyticsPanel.tsx` |

## Conventions

- Keep Next.js routing logic in `src/app` only.
- Keep reusable UI in `src/components`, organized by role (`layout`, `forms`, `tools`, `admin`).
- Keep shared domain types in `src/types` (not duplicated in UI files).
- Keep all server-only logic in `src/server`; do not import it into Client Components.
- Keep client analytics calls in `src/analytics` (not a generic `lib` grab-bag).
- Co-locate tests under the nearest module `__tests__` directory.
- Use `@/` absolute imports and avoid deep relative paths.

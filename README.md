# Break Everything

Free, open-source software tool directory for students, with safety metadata and a lightweight admin workflow.

Break Everything helps users discover downloadable tools, review trust signals (checksums and safety score), and request new tools to be added.

## Features

- Browse all tools at `/tools`
- View per-tool detail pages at `/tools/[slug]`
- Inspect safety metadata such as SHA-256 and safety score
- Submit tool requests from the public UI
- Manage tools and requests from `/admin` after authentication
- Use built-in API routes for tools, auth, and requests

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- SQLite via `better-sqlite3`
- Jest (`ts-jest`) for tests
- ESLint for linting

## Project Structure

See [`STRUCTURE.md`](./STRUCTURE.md) for the full directory map.

Key areas:

- `src/app` - routes, layouts, pages, API route handlers
- `src/components` - reusable UI components
- `src/server` - server-only modules (database, auth, rate limiting)
- `data` - local SQLite database files

## API Overview

- `GET /api/tools` - list tools (public)
- `POST /api/tools` - create tool (admin)
- `GET /api/tools/[slug]` - get one tool (public)
- `PUT /api/tools/[slug]` - update tool (admin)
- `DELETE /api/tools/[slug]` - delete tool (admin)
- `GET /api/auth` - auth status
- `POST /api/auth` - login
- `DELETE /api/auth` - logout
- `POST /api/requests` - submit tool request (public)
- `GET /api/requests` - list requests (admin)
- `PATCH /api/requests/[id]` - update request status (admin)
- `DELETE /api/requests/[id]` - delete request (admin)

## Configuration Notes

- Default DB path: `data/break-everything.db`
- Test DB path: set by `TEST_DB_PATH` in tests
- Admin authentication uses cookie-based sessions
- Required env vars:
  - `ADMIN_PASSWORD` - admin login password used for hashing/verification
  - `SESSION_SECRET` - entropy source for session token generation

### Security Note

Never commit real credentials. Keep `ADMIN_PASSWORD` and `SESSION_SECRET` in local env/runtime secret stores only.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for workflow, expectations, and validation steps.

## Changelog

See [`CHANGELOG.md`](./CHANGELOG.md) for notable project changes.

## License

No license file is currently present. Add a `LICENSE` file before public distribution.

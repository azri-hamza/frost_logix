Frost Logix Monorepo
====================

Stack: Nx (pnpm) monorepo with NestJS API, Angular web app, PostgreSQL, Prisma, Docker.

Structure
---------

- `apps/api/` – NestJS API (served with `nx serve api`)
- `apps/web/` – Angular SPA
- `libs/shared-types/` – Shared TypeScript DTOs/interfaces
- `prisma/` – Prisma schema and (generated) migrations
- `docker/` – Dockerfiles and Postgres init scripts

Environment / ports
-------------------

- API: `3333` (configurable via `API_PORT`)
- Web: `4200` (configurable via `WEB_PORT`)
- Postgres: `5432`

Setup
-----

1. Install tooling

- Node.js 20.x
- pnpm (`npm install -g pnpm`)
- Docker + docker-compose (optional)

2. Environment variables

```bash
cp .env.example .env
```

Adjust values as needed. For local development with Postgres on your host, the default `DATABASE_URL` pointing at `localhost:5432` is fine.

3. Install dependencies

```bash
pnpm install
```

4. Prisma client and migrations

```bash
pnpm prisma:generate
pnpm prisma:migrate --name init
```

This creates the initial migration for the `User` model defined in `prisma/schema.prisma`.

Local development (no Docker)
-----------------------------

1. Start Postgres

Either:

- Use your own Postgres instance on `localhost:5432` matching `POSTGRES_*` and `DATABASE_URL`, or
- Run the DB with Docker:

```bash
docker compose up postgres -d
```

2. Serve API and web

```bash
pnpm dev
```

This runs:

- `nx serve api` on `http://localhost:3333/api`
- `nx serve web` on `http://localhost:4200`

The Angular dev server uses a proxy:

- `/api` → `http://localhost:3333`

The frontend `UsersService` calls `/api/users`, which is forwarded to the API, so you do not hit CORS issues during local dev.

3. API endpoints

- Health: `GET http://localhost:3333/api/health`
- Users:
  - `GET http://localhost:3333/api/users`
  - `POST http://localhost:3333/api/users`

Example user payload:

```json
{
  "email": "jane@example.com",
  "first_name": "Jane",
  "last_name": "Doe"
}
```

4. Angular app

Visit `http://localhost:4200`. The home page lists users and provides a simple form to create a user.

Docker-based workflow
---------------------

1. Ensure `.env` is configured (copy from `.env.example`).

2. Run the whole stack:

```bash
docker compose up --build
```

3. Access services:

- Open: `http://localhost:${WEB_PORT:-4200}`

Routing through nginx:

- `/` serves the built Angular app
- `/api/*` is proxied to the Nest API container (backed by Nest global prefix `/api`)
- `/health` is proxied to the Nest API container health endpoint

Note: Only nginx is exposed to the host. The API and Postgres are internal to the Docker network by default.

If you need to connect to Postgres from your host (e.g. a DB GUI), temporarily add a `ports:` mapping to the `postgres` service in `docker-compose.yml`.

The API container runs:

- `pnpm prisma:generate` during build
- `pnpm prisma:migrate deploy` at container start (falls back to `prisma db push` if no migrations exist yet)
- Then starts the built API

nginx serves the built Angular app and proxies API requests.

Prisma schema & migration workflow
----------------------------------

Schema (`prisma/schema.prisma`) uses:

- `datasource db` with provider `postgresql` and `url = env("DATABASE_URL")`
- `generator client` with provider `prisma-client-js`
- `User` model:
  - `id` `String @id @default(uuid()) @db.Uuid`
  - `email` `String @unique`
  - `first_name` `String`
  - `last_name` `String`
  - `created_at` `DateTime @default(now())`

Typical change workflow:

1. Update `prisma/schema.prisma`.
2. Create a dev migration:

```bash
pnpm prisma:migrate --name <change-name>
```

3. Regenerate the client:

```bash
pnpm prisma:generate
```

4. Rebuild / restart Docker to apply migrations in containers:

```bash
docker compose up --build
```

Nx commands
-----------

- Serve API:

  ```bash
  pnpm nx serve api
  ```

- Serve web:

  ```bash
  pnpm nx serve web
  ```

- Build:

  ```bash
  pnpm build
  ```

- Lint:

  ```bash
  pnpm lint
  ```

- Test:

  ```bash
  pnpm test
  ```

Assumptions
-----------

- Prisma CLI currently requires Node.js 20.19+; the workspace is configured for Node 20.x (`.nvmrc` and `engines`), and you should run `pnpm install` and Prisma commands with Node 20.19 or newer within that range.
- Prisma CLI currently requires Node.js 20.19+; the workspace is configured for Node 20.x (`.nvmrc` and `engines`), and you should run `pnpm install` and Prisma commands with Node 20.19 or newer within that range.


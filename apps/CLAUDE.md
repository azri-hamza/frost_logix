# Frost Logix — Project Context

## Monorepo Structure

- **Monorepo tool:** Nx 22.5.3 with pnpm workspaces
- **Package manager:** pnpm (always use `-w` flag for root installs)

## Frontend (apps/web)

- **Framework:** Angular 20.3.17 — standalone components only, no NgModules
- **Change detection:** Zoneless (`provideZonelessChangeDetection()`) — no zone.js
- **Reactivity:** Signals (`signal`, `computed`, `effect`, `afterNextRender`) — no lifecycle hooks like `ngOnInit`
- **Build tool:** `@angular/build:application` (esbuild, NOT webpack or Vite)
- **Styling:** Tailwind CSS v4 + Spartan UI (shadcn-like components for Angular)
- **HTTP:** `provideHttpClient(withFetch())`
- **Template syntax:** New control flow (`@if`, `@for`, `@switch`) — never use `*ngIf` or `*ngFor`
- **Import alias for UI lib:** `@frost-logix/ui`
- **PostCSS config:** `.postcssrc.json` at project root (NOT `postcss.config.js`)
- **Proxy config:** `apps/web/proxy.conf.json` for local dev, `apps/web/proxy.docker.json` for Docker

## Backend (apps/api)

- **Framework:** NestJS 11
- **Language:** TypeScript
- **ORM:** Prisma 6 with PostgreSQL
- **Global API prefix:** `/api` (all routes are under `/api`)
- **Runtime:** Node.js 20

## Database

- **Database:** PostgreSQL 16
- **ORM:** Prisma 6.19.2
- **Migrations:** Use `prisma migrate deploy` (never `prisma migrate dev`) in production/Docker
- **Schema location:** `prisma/schema.prisma`

## Shared Types

- **Package:** `@frost-logix/shared-types`
- **Usage:** Shared between frontend and backend (DTOs, interfaces)

## UI Library

- **Component library:** Spartan UI (`@spartan-ng/brain`) — Angular port of shadcn/ui
- **Styling:** Tailwind CSS v4 utility classes + CSS variables in `apps/web/src/styles.css`
- **Theme:** Neutral theme using OKLCH color format
- **Components location:** `libs/ui/`
- **Import alias:** `@frost-logix/ui`

## Docker Setup

- **Services:** postgres, api, nginx
- **nginx:** Serves Angular SPA and proxies `/api` requests to NestJS
- **Environment:** Variables in `.env` file at project root

## Development Commands

```bash
pnpm dev                                           # start both api and web
pnpm nx serve api                                  # start only api
pnpm nx serve web                                  # start only web
docker compose up postgres -d                      # start only postgres for local dev
pnpm nx run web:build:production                   # production build
pnpm nx g @spartan-ng/cli:ui button --project=web  # add spartan component
```

## Coding Rules — ALWAYS FOLLOW THESE

- Use `inject()` instead of constructor injection in Angular
- Use signals for all reactive state (`signal`, `computed`, `effect`)
- Never use `*ngIf` or `*ngFor` — always use `@if` and `@for`
- Always use `track` in `@for` loops
- Use `afterNextRender()` instead of `ngOnInit` for initialization logic
- Install packages with `pnpm add <package> -w` at workspace root
- Never delete files in `prisma/migrations/`
- All NestJS endpoints start with `/api` due to global prefix
- nginx proxies `/api/users` → `http://api:3333/api/users` (no path stripping)
- Tailwind config is CSS-only in `styles.css` — no `tailwind.config.js`
- PostCSS config must be `.postcssrc.json` — not `postcss.config.js`

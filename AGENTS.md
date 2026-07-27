# Life Care Plus — Agent Guide

## Repo structure
```
life-care-plus/
├── client/      Next.js 16 + React 19 (App Router, Tailwind v4, shadcn/ui)
├── server/      Express 5 + TypeScript + Prisma 7 + PostgreSQL + Redis
└── docker-compose.yml   PostgreSQL 16, Redis 7, backend service
```
Each package is independent (own `package.json`, `node_modules`, configs). No monorepo tools.

## Key commands

### Client (`client/`)
| Command | Purpose |
|---------|---------|
| `npm run dev` | `next dev --turbo` |
| `npm run build` | `next build` |
| `npm run lint` | ESLint (Next.js config) |
| `npm run analyze` | Bundle analyzer (`ANALYZE=true next build`) |

### Server (`server/`)
| Command | Purpose |
|---------|---------|
| `npm run dev` | `ts-node-dev --respawn --poll --transpile-only ./src/server.ts` |
| `npm run build` | `tsc` (outputs to `dist/`) |
| `npm run start` | `node dist/server.js` |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint --fix |
| `npm run format` | Prettier on `src/**/*.ts` |
| `npm run prisma:generate` | `prisma generate --schema=./prisma/schema` |
| `npm run prisma:migrate:dev` | `prisma migrate dev --schema=./prisma/schema` |
| `npm run db:studio` | Prisma Studio |
| `npm run stripe:webhook` | `stripe listen --forward-to localhost:5000/webhook` |

**No test frameworks exist** — do not attempt to run tests.

## Architecture

### Frontend
- **Entry**: `client/src/proxy.ts` (Next.js middleware, auth/route protection) — NOT `middleware.ts`
- **App Router** with route groups: `(auth)`, `(dashboard)`, `(public)`
- **Pattern**: component → hook → service → style
- **HTTP**: Server-side fetch via `client/src/services/http.ts` (cookie-based auth)
- **Auth**: JWT access + refresh tokens in cookies; auto-refresh in proxy

### Backend
- **Entry**: `server/src/server.ts` → bootstraps Express, seeds super admin, initializes Socket.io + BullMQ jobs
- **App setup**: `server/src/app.ts` (Sentry, session, passport, CORS, cron, routes, error handler)
- **API routes**: All under `/api/v1` — registered in `server/src/app/routes/index.ts` (15 modules)
- **Module pattern**: `{module}.{routes,controller,service,validation,interface,constants}` per folder
- **Auth**: JWT + Passport (Google OAuth, Facebook OAuth) + session
- **Database**: Prisma 7 with `@prisma/adapter-pg` + connection pool — schema split across files in `server/prisma/schema/` (not a single `schema.prisma`)
- **Background jobs**: BullMQ (email + notification queues) via Redis
- **Real-time**: Socket.io with Redis adapter — `io` available globally as `(global as any).io`
- **File upload**: Cloudinary (primary) + multer (local fallback in `server/uploads/`)
- **Logging**: Winston (daily rotate) + Morgan + Sentry — logs at `server/logs/`

### Existing agent instruction files
- `.github/agents/frontend.md` — scope-restricted to `/client`
- `.github/agents/backend-api.md` — scope-restricted to `/server`

## Conventions
- **Server modules**: route → controller → service → validation — every module gets these files
- **API response**: Unified `sendResponse` helper in `server/src/shared/sendResponse.ts`
- **Zod v4** used for validation on both sides
- **ESLint**: `no-console` (warn), `no-unused-vars` (warn, ignore `_`), `no-explicit-any` (warn)
- **Prettier**: single quotes, trailing commas, 100 print width, 2 tab width
- **Stripe webhook**: Listens at `POST /webhook` (raw body before JSON parser)

## Quirks & gotchas
- Prisma schema lives in `server/prisma/schema/` directory (not `server/prisma/schema.prisma`) — always pass `--schema=./prisma/schema`
- Server uses **Express 5** — `app.use` behavior may differ from v4
- Client uses **Tailwind CSS v4** (not v3) — `@tailwindcss/postcss` plugin, no `tailwind.config.ts`
- `proxy.ts` is the Next.js middleware file (not the conventional `middleware.ts`)
- Docker Compose frontend service is **commented out** — run frontend locally
- `server/vercel.json` allows deploying the backend on Vercel via `@vercel/node`

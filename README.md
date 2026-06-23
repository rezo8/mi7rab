# mihrab

> مِحراب — the niche one turns toward. A personal, self-hostable sanctuary for
> artistic musings and the inspirations around them.

The first screen is a quiet ritual: a single **Oblique Strategy** (Brian Eno &
Peter Schmidt) drawn from a deck, with a way to draw another. It's built on a
secure foundation meant to grow into writing, photos, and video.

## Stack

| Layer    | Choice                                                                      |
| -------- | --------------------------------------------------------------------------- |
| Monorepo | pnpm workspaces + Turborepo (Node 22)                                       |
| Frontend | React + Vite + TS · TanStack Router + Query · Tailwind v4 · Fraunces/Hanken |
| Backend  | Hono · Drizzle ORM · node-postgres → **Postgres**                           |
| Auth     | **Better Auth** (open source), email + password, sessions in Redis          |
| Cache    | **Redis** — session store, deck cache, rate limiting                        |

```
apps/
  api/   Hono backend — auth, the strategies API, Drizzle schema + migrations
  web/   React app — the "Niche at dusk" Oblique Strategies screen
packages/
  shared/         API contract types       eslint-config/  shared lint config
  tsconfig/       shared TS configs
```

## Local development

**Prerequisites:** Node 22, Docker, and Corepack (ships with Node — run
`corepack enable` once; all commands below use `corepack pnpm`).

```bash
# 1. install
corepack pnpm install

# 2. configure the API (the dev defaults work as-is; set a real secret for prod)
cp .env.example apps/api/.env

# 3. start Postgres + Redis (host ports 5433 / 6379 to avoid local clashes)
docker compose up -d

# 4. create the schema and seed the Oblique Strategies deck (~115 cards)
corepack pnpm db:migrate
corepack pnpm db:seed

# 5. run both apps (api → http://localhost:3000, web → http://localhost:5173)
corepack pnpm dev
```

Open **http://localhost:5173** and draw a card.

### Handy scripts

| Command                  | What it does                                       |
| ------------------------ | -------------------------------------------------- |
| `corepack pnpm dev`      | Run api + web in watch mode (Turborepo)            |
| `corepack pnpm build`    | Build all packages                                 |
| `corepack pnpm db:generate` | Generate a Drizzle migration from schema changes |
| `corepack pnpm db:migrate`  | Apply migrations                                 |
| `corepack pnpm db:seed`     | (Re)seed the deck — idempotent                   |

When the Better Auth config changes, regenerate its Drizzle schema:

```bash
corepack pnpm --filter @mihrab/api exec better-auth generate \
  --config ./src/auth.ts --output ./src/db/schema/auth.ts -y
```

## Security notes

Secure-by-default for browser clients: HttpOnly + `SameSite=Lax` session
cookies, an exact-origin CORS allowlist, CSRF via Better Auth trusted origins
(cross-origin mutations are rejected), Redis-backed rate limiting, and
fail-fast zod validation of all environment variables. Set a strong
`BETTER_AUTH_SECRET` (`openssl rand -base64 32`) before deploying.

## Roadmap

- **Media**: saving/uploading writing, photos, and video to S3-compatible
  object storage (a `media` table is the natural next migration).
- **Deploy**: Railway/Render config (managed Postgres + Redis) + a production
  Docker target; v1 runs locally via Docker Compose.
- More inspirations alongside the Oblique Strategies.

## License

MIT — see [LICENSE](./LICENSE).

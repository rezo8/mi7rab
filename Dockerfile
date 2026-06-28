# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@11.8.0 --activate

WORKDIR /app

# Copy manifests first so Docker layer-caches the install step
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json ./
COPY packages/ packages/
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN pnpm install --frozen-lockfile

# Copy source and build the web frontend
COPY apps/api/ apps/api/
COPY apps/web/ apps/web/

RUN pnpm --filter @mihrab/web build

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@11.8.0 --activate

WORKDIR /app

# Workspace manifests (pnpm needs these to resolve the monorepo graph)
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/turbo.json ./
COPY --from=builder /app/packages/ packages/

# API source + its installed node_modules
COPY --from=builder /app/apps/api/ apps/api/
COPY --from=builder /app/node_modules/ node_modules/

# Built frontend — Hono serves this as static files in production
COPY --from=builder /app/apps/web/dist/ web-dist/

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["apps/api/node_modules/.bin/tsx", "apps/api/src/server.ts"]

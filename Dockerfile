# syntax=docker/dockerfile:1.7
# Lightweight runtime image — the Nuxt build is produced by the CI before this Dockerfile runs.
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# 1. Manifests first so the deps layer stays cached as long as package*.json don't change
COPY package.json package-lock.json ./

# 2. BuildKit cache mount keeps npm tarballs across rebuilds
#    --ignore-scripts: skip postinstall (prisma generate + nuxt prepare) — already done in CI
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --ignore-scripts --legacy-peer-deps \
 && npm install prisma --no-save \
 && npm cache clean --force

# 3. Code-level layers — only these are invalidated by an app change
COPY .output ./.output
COPY prisma ./prisma
COPY prisma.config.ts ./

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push && node .output/server/index.mjs"]

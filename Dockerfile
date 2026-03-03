# ── Stage 1 : Dépendances ─────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# --ignore-scripts évite que postinstall plante (nuxt prepare nécessite
# les sources, prisma generate tourne juste après)
RUN npm install --ignore-scripts

# Génération du client Prisma (DATABASE_URL factice — generate ne se connecte pas)
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# ── Stage 2 : Build ───────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# nuxt build inclut nuxt prepare en interne
RUN npm run build

# ── Stage 3 : Image de production ─────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

COPY --from=builder /app/.output ./.output

# Prisma CLI + schema + config pour le db push au démarrage
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/node_modules/dotenv ./node_modules/dotenv
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000

CMD ["sh", "-c", "./node_modules/.bin/prisma db push && node .output/server/index.mjs"]

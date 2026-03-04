# ── Stage 1 : Dépendances ─────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# On remplace postinstall pour ne lancer que prisma generate
# (nuxt prepare nécessite les sources, pas disponibles ici)
# Sans --ignore-scripts, le postinstall de prisma s'exécute → engines téléchargés
RUN npm pkg set scripts.postinstall="prisma generate"
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npm install

# ── Stage 2 : Build ───────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
# Client Prisma généré (au cas où il n'existe pas sur le host)
COPY --from=deps /app/server/generated ./server/generated
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

# Prisma CLI + engines + schema pour db push au démarrage
COPY --from=deps /app/node_modules/prisma ./node_modules/prisma
COPY --from=deps /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=deps /app/node_modules/.bin/prisma* ./node_modules/.bin/
COPY --from=deps /app/node_modules/dotenv ./node_modules/dotenv
COPY --from=deps /app/prisma ./prisma
COPY prisma.config.ts ./

EXPOSE 3000

CMD ["sh", "-c", "./node_modules/.bin/prisma db push && node .output/server/index.mjs"]

# ── Stage 1 : Dépendances ─────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# --ignore-scripts évite que postinstall plante (nuxt prepare nécessite
# les sources, prisma generate tourne juste après)
RUN npm ci --ignore-scripts

# Génération du client Prisma (ne nécessite pas de connexion DB)
RUN npx prisma generate

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

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]

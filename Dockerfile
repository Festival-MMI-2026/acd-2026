# On part d'une image légère car le build est déjà fait par GitHub
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# On récupère les dossiers extraits du .tar.gz (transférés par SCP)
COPY .output ./.output
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY package.json ./
COPY package-lock.json ./

# On installe UNIQUEMENT les dépendances de prod pour Prisma
RUN npm install -g prisma \
    && npm ci --omit=dev --legacy-peer-deps \
    && npm cache clean --force

EXPOSE 3000

# On lance Prisma push puis l'app
CMD ["sh", "-c", "npx prisma db push && node .output/server/index.mjs"]
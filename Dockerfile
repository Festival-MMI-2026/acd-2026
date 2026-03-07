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

# On installe les dépendances de prod + prisma (nécessaire pour prisma.config.ts)
# --ignore-scripts: le postinstall (prisma generate + nuxt prepare) n'est pas nécessaire
# car .output est déjà buildé par le CI avec le client Prisma généré
RUN npm ci --omit=dev --ignore-scripts --legacy-peer-deps \
    && npm install prisma --no-save \
    && npm cache clean --force

EXPOSE 3000

# On lance Prisma push puis l'app
CMD ["sh", "-c", "npx prisma db push && node .output/server/index.mjs"]
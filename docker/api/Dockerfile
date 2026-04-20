FROM node:20-alpine

WORKDIR /usr/src/app

RUN npm install -g pnpm@8.15.9

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml nx.json tsconfig.base.json tsconfig.json .npmrc* .env.example ./ 
COPY apps ./apps
COPY libs ./libs
COPY prisma ./prisma

# Install ALL deps (including dev) so prisma and nx are available at build time
RUN pnpm install --frozen-lockfile=false

# Generate Prisma client and build the app
RUN pnpm prisma:generate && pnpm nx build api

ENV NODE_ENV=production

ENV API_PORT=3333
EXPOSE 3333

CMD sh -c "pnpm prisma:migrate:deploy || pnpm prisma db push && node dist/apps/api/main.js"


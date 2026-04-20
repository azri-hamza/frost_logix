FROM node:20-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production

RUN npm install -g pnpm@8.15.9

COPY package.json pnpm-lock.yaml* nx.json tsconfig.base.json tsconfig.json .npmrc* .env.example ./ 
COPY apps ./apps
COPY libs ./libs

RUN pnpm install --frozen-lockfile=false \
  && pnpm nx build web

ENV WEB_PORT=4200
EXPOSE 4200

CMD pnpm nx serve-static web --port=4200


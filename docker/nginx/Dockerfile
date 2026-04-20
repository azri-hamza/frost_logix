FROM node:20-alpine AS build

WORKDIR /usr/src/app

RUN npm install -g pnpm@8.15.9

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json tsconfig.base.json tsconfig.json .prettierrc .prettierignore eslint.config.mjs ./ 
COPY apps ./apps
COPY libs ./libs

RUN pnpm install --frozen-lockfile
RUN pnpm nx build web --configuration=production

FROM nginx:1.27-alpine

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/dist/apps/web/browser /usr/share/nginx/html


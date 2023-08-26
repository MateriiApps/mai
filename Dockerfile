# BUILDER
FROM node:18-alpine as builder

WORKDIR /app
RUN npm i -g pnpm@8.6.9

COPY pnpm-lock.yaml ./
RUN pnpm fetch --prod # Cache prod fetch layer for next builder
RUN pnpm fetch --dev

COPY ./package.json ./
RUN pnpm install --offline --frozen-lockfile

COPY ./tsconfig.json ./
COPY ./src ./src
RUN pnpm build

# RUNNER
FROM node:18-alpine
ENV NODE_ENV production

WORKDIR /app
RUN npm i -g pnpm@8.6.9

COPY pnpm-lock.yaml ./
RUN pnpm fetch --prod

COPY package.json ./
RUN pnpm install --offline --frozen-lockfile --prod

COPY ./data ./data
COPY --from=builder /app/dist ./dist

ENTRYPOINT ["node", "--no-warnings", "--experimental-specifier-resolution=node", "."]

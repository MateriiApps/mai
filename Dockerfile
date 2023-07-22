FROM node:18-alpine as builder

WORKDIR /app
RUN npm i -g pnpm
ADD ./package.json ./pnpm-lock.yaml ./tsconfig.json ./
RUN pnpm i --frozen-lockfile
ADD ./src ./src
RUN pnpm build

FROM node:18-alpine
RUN npm i -g pnpm
ADD ./package.json ./pnpm-lock.yaml ./data ./
RUN pnpm i --frozen-lockfile
COPY --from=builder /app/dist ./

CMD ["pnpm", "start"]

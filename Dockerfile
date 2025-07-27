# BUILDER
FROM --platform=$BUILDPLATFORM node:22-alpine as builder

WORKDIR /app
RUN npm i -g corepack

COPY pnpm-lock.yaml package.json ./
RUN corepack install && pnpm install --frozen-lockfile --shamefully-hoist

COPY ./tsconfig.json ./
COPY ./src ./src
RUN pnpm build

# Prepare next stage to copy node_modules
RUN pnpm install --frozen-lockfile --shamefully-hoist --offline --prod

# RUNNER
FROM alpine:3
RUN apk add --update --no-cache nodejs

WORKDIR /app

COPY package.json ./
COPY ./data ./data
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ENV NODE_ENV="production"
ENTRYPOINT ["node", "--no-warnings", "--import=extensionless/register", "."]

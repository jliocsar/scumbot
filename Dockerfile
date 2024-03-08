FROM node:19-alpine AS base

FROM base AS builder

RUN apk add --no-cache libc6-compat ffmpeg python3 alpine-sdk
WORKDIR /app

COPY package*json tsconfig.json rollup.config.ts ./
COPY src ./src

RUN npm ci && \
    npm run build && \
    npm prune --production

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 scumbot

COPY --from=builder --chown=scumbot:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=scumbot:nodejs /app/package.json /app/package.json
COPY --from=builder --chown=scumbot:nodejs /app/dist /app/dist

USER scumbot

CMD ["node", "dist/index.civet.js"]
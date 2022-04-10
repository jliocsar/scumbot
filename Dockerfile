# Install dependencies image
FROM node:gallium AS deps
WORKDIR /deps

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Production image
FROM node:gallium AS runner
WORKDIR /app

ARG SERVER_PORT
ARG DISCORD_TOKEN
ARG APPLICATION_ID
ARG CLIENT_SECRET

ENV NODE_ENV production
ENV SERVER_PORT $SERVER_PORT
ENV DISCORD_TOKEN $DISCORD_TOKEN
ENV APPLICATION_ID $APPLICATION_ID
ENV CLIENT_SECRET $CLIENT_SECRET

COPY . .
COPY --from=deps /deps/node_modules ./node_modules

EXPOSE ${SERVER_PORT}

CMD ["yarn", "start"]

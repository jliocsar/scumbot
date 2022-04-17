import type { Integration } from '@sentry/types'
import 'dotenv/config'
import express, { Application, NextFunction } from 'express'
import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'

import { registerApplicationCommands } from './register-application-commands'
import { setupClientEvents } from './events'
import { setupClient } from './setup-discord-client'
import { PORT, SENTRY_DSN } from './constants/environment.constants'

function setupSentryMiddlewares(app: Application) {
  app.use(Sentry.Handlers.requestHandler())
  app.use(Sentry.Handlers.tracingHandler())
}

function setupAppErrorHandling(app: Application) {
  app.use(Sentry.Handlers.errorHandler())
}

function initializeSentry(app: Application, dsn = SENTRY_DSN) {
  const integrations: Integration[] = [
    new Sentry.Integrations.Http({
      tracing: true,
      breadcrumbs: true,
    }),
    new Tracing.Integrations.Express({ app }),
  ]

  Sentry.init({
    dsn,
    integrations,
    tracesSampleRate: 1.0,
  })

  return setupSentryMiddlewares(app)
}

async function startDiscordBot() {
  const client = await setupClient()
  await setupClientEvents(client)
  await registerApplicationCommands()
}

;(async function startServer() {
  // Starts the Discord bot's client
  await startDiscordBot()

  const app = express()

  // Initializes Sentry and enables Express' middleware tracing
  initializeSentry(app)

  // Root `GET` route
  app.get('/', (request, response) => {
    response.send('Hello from 🥓')
  })

  // Healthcheck (can be used for ECS and such)
  app.get('/healthcheck', (request, response) => {
    response.status(200).json({
      ok: true,
    })
  })

  setupAppErrorHandling(app)

  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
  })
})()

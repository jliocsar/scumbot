import 'dotenv/config'
import express from 'express'

import { registerApplicationCommands } from './register-application-commands'
import { setupClientEvents } from './events'
import { setupClient } from './setup-discord-client'
import { PORT } from './constants/environment.constants'

async function startDiscordBot() {
  const client = await setupClient()
  await setupClientEvents(client)
  await registerApplicationCommands()
}

;(async function startServer() {
  await startDiscordBot()

  const app = express()

  app.get('/', (request, response) => {
    response.send('Hello from 🥓')
  })

  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
  })
})()

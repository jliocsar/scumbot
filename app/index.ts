import 'dotenv-safe/config'
import express from 'express'

import { registerApplicationCommands } from './register-application-commands'
import { setupClientEvents } from './events'
import { setupClient } from './client'

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

  const port = process.env.PORT || 3000

  app.listen(port, () => {
    console.log(`Listening on port ${port}`)
  })
})()

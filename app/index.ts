import 'dotenv-safe/config'
import express from 'express'

import { setupClient } from './client'
import { setupClientEvents } from './events'
import { registerGlobalCommands } from './register-global-commands'

async function startDiscordBot() {
  const client = await setupClient()
  await setupClientEvents(client)
  await registerGlobalCommands()
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

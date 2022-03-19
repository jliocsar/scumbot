import type { Client } from 'discord.js'
import signale from 'signale'
import 'dotenv-safe/config'

import { createClient } from './client'
import { setupClientEvents } from './events'

function setupClient(client: Client) {
  client.on('ready', () => {
    signale.success('Client ready as', client?.user?.tag)
  })

  return client
}

async function startDiscordBot() {
  const client = await createClient(setupClient)
  await setupClientEvents(client)
}

startDiscordBot()

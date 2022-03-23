import 'dotenv-safe/config'

import { setupClient } from './client'
import { setupClientEvents } from './events'
import { registerGlobalCommands } from './register-global-commands'

async function startDiscordBot() {
  const client = await setupClient()
  await setupClientEvents(client)
  await registerGlobalCommands()
}

startDiscordBot()

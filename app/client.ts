import { Client, Intents } from 'discord.js'

import type { SetupClientFn } from './types/client.types'
import { DISCORD_TOKEN } from './constants/environment.constants'

export async function createClient(setupClientFn: SetupClientFn) {
  const client = new Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      Intents.FLAGS.DIRECT_MESSAGES,
      Intents.FLAGS.GUILD_VOICE_STATES,
      Intents.FLAGS.GUILD_WEBHOOKS,
      Intents.FLAGS.GUILD_PRESENCES,
      Intents.FLAGS.GUILD_SCHEDULED_EVENTS,
    ],
  })

  setupClientFn(client)
  await client.login(DISCORD_TOKEN)

  return client
}

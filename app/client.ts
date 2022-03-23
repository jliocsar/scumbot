import { Client, Intents } from 'discord.js'

import { DISCORD_TOKEN } from './constants/environment.constants'
import signale from 'signale'

export const client = new Client({
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

export async function setupClient() {
  client.on('ready', () => {
    signale.success('Client ready as', client?.user?.tag)
  })
  await client.login(DISCORD_TOKEN)
  return client
}

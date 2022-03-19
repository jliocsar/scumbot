import type { Client } from 'discord.js'

export type SetupClientFn = {
  (client: Client): Client
}

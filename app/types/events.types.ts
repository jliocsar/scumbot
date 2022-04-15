import type { CommandInteraction } from 'discord.js'

export type EventMap = {
  [key: string]: (interaction: CommandInteraction) => Promise<unknown>
}

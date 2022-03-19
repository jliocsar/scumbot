import type { Message } from 'discord.js'

export type EventMap = {
  [key: string]: (message: Message, ...commandArgs: string[]) => Promise<void>
}

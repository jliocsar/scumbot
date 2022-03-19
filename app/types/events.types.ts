import type { Message } from 'discord.js'

import { Command } from '../constants/commands.constants'

export type EventMap = {
  [key: string]: (message: Message, ...commandArgs: string[]) => Promise<void>
}

export type CommandOptionChoice = {
  name: string
  value: string
}

export type CommandOption = {
  name: string
  description: string
  type: number
  required: boolean
  choices: CommandOptionChoice[]
}

export type CommandMeta = {
  name: Command
  type?: number
  description: string
  options: CommandOption[]
}

import type { Client, Message } from 'discord.js'

import { COMMAND_PREFIX } from '../constants/commands.constants'

import { eventMap } from './event-map'

async function handleUserMessage(message: Message<boolean>) {
  const { content } = message
  const isValidCommandMessage = content?.startsWith(COMMAND_PREFIX)

  if (isValidCommandMessage) {
    const [prefixedUserCommand, ...userCommandArgs] = content.split(/\s+/)
    const userCommand = prefixedUserCommand.replace(COMMAND_PREFIX, '')
    const command = eventMap[userCommand]

    if (command) {
      return command(message, ...userCommandArgs)
    }

    await message.reply('Invalid command, homie')
  }
}

export async function setupClientEvents(client: Client) {
  client.on('messageCreate', handleUserMessage)
}

import type { Client, Interaction } from 'discord.js'

import { eventMap } from './event-map'

async function handleUserInteraction(interaction: Interaction) {
  if (interaction.isCommand()) {
    const commandHandler = eventMap[interaction.commandName]

    if (commandHandler) {
      await commandHandler(interaction)
    }
  }
}

export async function setupClientEvents(client: Client) {
  client.on('interactionCreate', handleUserInteraction)
}

import type { CommandInteraction } from 'discord.js'

import { videosQueue } from '../play'

export async function queueEventHandler(interaction: CommandInteraction) {
  if (videosQueue.isEmpty()) {
    return interaction.reply('The queue is empty.')
  }

  return interaction.reply(
    `The current video queue is: ${JSON.stringify(
      videosQueue.queue.join(', '),
    )}`,
  )
}

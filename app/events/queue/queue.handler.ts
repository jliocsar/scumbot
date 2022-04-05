import type { CommandInteraction } from 'discord.js'

import { videosQueue } from '../play'

export async function queueEventHandler(interaction: CommandInteraction) {
  return interaction.reply(JSON.stringify(videosQueue))
}

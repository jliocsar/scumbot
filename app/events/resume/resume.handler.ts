import type { CommandInteraction } from 'discord.js'

import { botVideoState } from '../play'

export async function resumeEventHandler(interaction: CommandInteraction) {
  if (!botVideoState.isPlaying && botVideoState.subscription?.player) {
    botVideoState.isPlaying = true
    botVideoState.subscription.player.unpause()
    return interaction.reply('👌🏻')
  }

  return interaction.reply('There is no video playing')
}

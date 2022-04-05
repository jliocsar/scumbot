import type { CommandInteraction } from 'discord.js'

import { botVideoState } from '../play'

export async function pauseEventHandler(interaction: CommandInteraction) {
  if (botVideoState.isPlaying && botVideoState.subscription?.player) {
    botVideoState.isPlaying = false
    botVideoState.subscription.player.pause()
    return interaction.reply('👌🏻')
  }

  return interaction.reply('There is no video playing')
}

import type { CommandInteraction } from 'discord.js'

import { botVideoState } from '../play'

export async function pauseEventHandler(interaction: CommandInteraction) {
  if (botVideoState.isPlaying && botVideoState.audioPlayer) {
    botVideoState.isPlaying = false
    botVideoState.audioPlayer.pause()
    return interaction.reply('👌🏻')
  }

  return interaction.reply('There is no video playing')
}

import type { CommandInteraction } from 'discord.js'

import { botVideoState } from '../play'

export async function resumeEventHandler(interaction: CommandInteraction) {
  if (!botVideoState.isPlaying && botVideoState.audioPlayer) {
    botVideoState.isPlaying = true
    botVideoState.audioPlayer.unpause()
    return interaction.reply('👌🏻')
  }

  return interaction.reply('There is no video playing')
}

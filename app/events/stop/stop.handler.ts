import type { CommandInteraction } from 'discord.js'

import { botVideoState, videosQueue } from '../play'
import { botRadioState } from '../radio'

function stopVideo() {
  botVideoState.isPlaying = false
  videosQueue.clear()
  botVideoState.subscription?.connection.disconnect()
}

function stopRadio() {
  botRadioState.isPlaying = false

  if (botRadioState.subscription?.connection) {
    botRadioState.subscription.connection.disconnect()
  }
}

export async function stopEventHandler(interaction: CommandInteraction) {
  if (botVideoState.isPlaying) {
    stopVideo()
    return interaction.reply('👌🏻')
  }

  if (botRadioState.isPlaying) {
    stopRadio()
    return interaction.reply('👌🏻')
  }

  return interaction.reply('No video or radio is currently playing')
}

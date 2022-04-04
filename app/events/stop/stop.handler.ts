import type { Message } from 'discord.js'

import { botVideoState, videosQueue } from '../play'
import { botRadioState } from '../radio'

function stopVideo() {
  botVideoState.isPlaying = false
  videosQueue.clear()

  if (botVideoState.subscription?.connection) {
    botVideoState.subscription.connection.disconnect()
  }
}

function stopRadio() {
  botRadioState.isPlaying = false

  if (botRadioState.subscription?.connection) {
    botRadioState.subscription.connection.disconnect()
  }
}

export async function stopEventHandler(message: Message) {
  if (botVideoState.isPlaying) {
    return stopVideo()
  }

  if (botRadioState.isPlaying) {
    return stopRadio()
  }

  await message.reply('No video or radio is currently playing')
}

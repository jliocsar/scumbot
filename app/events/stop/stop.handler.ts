import type { Message } from 'discord.js'

import { botVideoState } from '../play'

function stopVideo() {
  if (botVideoState.subscription?.connection) {
    botVideoState.subscription.connection.disconnect()
  }
}

export async function stopEventHandler(message: Message) {
  if (botVideoState.isPlaying) {
    return stopVideo()
  }

  await message.reply('No video is currently playing')
}

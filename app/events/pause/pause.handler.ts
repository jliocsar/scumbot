import type { Message } from 'discord.js'

import { botVideoState } from '../play'

export async function pauseEventHandler(message: Message) {
  if (!botVideoState.isPlaying) {
    message.reply('There is no video playing')
    return
  }

  if (botVideoState.subscription?.player) {
    botVideoState.isPlaying = false
    botVideoState.subscription.player.pause()
    return
  }
}

import type { Message } from 'discord.js'

import { botVideoState } from '../play'

export async function resumeEventHandler(message: Message) {
  if (botVideoState.isPlaying) {
    message.reply('The video is already playing')
    return
  }

  if (botVideoState.subscription?.player) {
    botVideoState.isPlaying = true
    botVideoState.subscription.player.unpause()
    return
  }

  message.reply('There is no video playing')
}

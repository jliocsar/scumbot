import type { Message } from 'discord.js'

import { botVideoState, playVideo, videosQueue } from '../play'

export async function skipEventHandler(message: Message) {
  if (botVideoState.isPlaying && !videosQueue.isEmpty()) {
    const videoUrl = videosQueue.unshift()
    return playVideo(videoUrl)
  }

  await message.reply('No video is currently playing and/or the queue is empty')
}

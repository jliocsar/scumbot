import type { CommandInteraction } from 'discord.js'

import { botVideoState, playVideo, videosQueue } from '../play'

export async function skipEventHandler(interaction: CommandInteraction) {
  if (botVideoState.isPlaying && !videosQueue.isEmpty()) {
    const videoUrl = videosQueue.unshift()
    await playVideo(videoUrl)
    return interaction.reply('👌🏻')
  }

  return interaction.reply(
    'No video is currently playing and/or the queue is empty',
  )
}

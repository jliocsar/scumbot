import type { CommandInteraction } from 'discord.js'

import {
  createVideoAudioVoiceConnection,
  searchYouTubeUrl,
} from './play.service'

export async function playEventHandler(interaction: CommandInteraction) {
  await interaction.deferReply()

  const videoUrl = interaction.options.getString('url')

  if (videoUrl) {
    const youtubeUrlMatch = /^http?s:\/\//g
    const isYouTubeUrl = youtubeUrlMatch.test(videoUrl)

    if (isYouTubeUrl) {
      return createVideoAudioVoiceConnection(interaction, videoUrl)
    }

    return interaction.followUp('Not a valid YouTube URL, dawg')
  }

  const search = interaction.options.getString('search') ?? ''
  const isEmptyInput = !videoUrl && !search

  if (isEmptyInput) {
    return interaction.followUp(
      'You need to provide a video url or search query',
    )
  }

  const searchedUrl = await searchYouTubeUrl(interaction, search)

  if (searchedUrl) {
    return createVideoAudioVoiceConnection(interaction, searchedUrl, search)
  }

  return interaction.followUp('Invalid video url, homie')
}

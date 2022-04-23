import type { CommandInteraction } from 'discord.js'

import { botVideoState } from '../play'

import { botRadioState, createStreamPlayingConnection } from './radio.service'

export async function radioEventHandler(interaction: CommandInteraction) {
  await interaction.deferReply()

  const streamingUrl = interaction.options.getString('url')

  if (!streamingUrl) {
    return interaction.followUp('You need to provide a video url')
  }

  if (botVideoState.isPlaying) {
    return interaction.followUp('There is a video playing already')
  }

  botRadioState.isPlaying = true

  const isValidUrl = /^http?s:\/\//.test(streamingUrl)

  if (isValidUrl) {
    return createStreamPlayingConnection(interaction, streamingUrl)
  }

  return interaction.followUp('Not a valid URL, homie')
}

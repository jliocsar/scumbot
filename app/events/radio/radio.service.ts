import {
  AudioPlayer,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  NoSubscriberBehavior,
  PlayerSubscription,
  StreamType,
  VoiceConnection,
  VoiceConnectionStatus,
} from '@discordjs/voice'
import * as Sentry from '@sentry/node'
import { CommandInteraction } from 'discord.js'

import { client } from '~/clients/bot/bot.client'

export type BotRadioState = {
  isPlaying: boolean
  hasMountedErrorEvents: boolean
  audioPlayer?: AudioPlayer
  subscription?: PlayerSubscription | null
}

export const botRadioState: BotRadioState = {
  isPlaying: false,
  hasMountedErrorEvents: false,
}

export async function playStream(streamUrl: string) {
  const resource = createAudioResource(streamUrl, {
    inputType: StreamType.OggOpus,
  })

  botRadioState.audioPlayer?.play(resource)
}

export function setupConnectionEvents(connection: VoiceConnection) {
  const handleStreamPlayingStop = (error?: Error) => {
    botRadioState.isPlaying = false
    botRadioState.subscription = null

    if (error) {
      Sentry.withScope(scope => {
        scope.setExtra('emitter', 'connection/process')
        Sentry.captureException(error)
      })
    }
  }

  const handleDisconnect = (error?: Error) => {
    handleStreamPlayingStop(error)
    connection.destroy()
  }

  connection.on('error', handleDisconnect)
  connection.on(VoiceConnectionStatus.Disconnected, () => {
    handleDisconnect()
  })
  connection.on(VoiceConnectionStatus.Destroyed, () => {
    handleDisconnect()
  })
}

export async function createStreamPlayingConnection(
  interaction: CommandInteraction,
  streamUrl: string,
) {
  if (!interaction.guildId || !interaction.user.client.voice) {
    return interaction.followUp(
      'You need to be in a voice channel to play music',
    )
  }

  if (!interaction.guild?.voiceAdapterCreator) {
    return interaction.followUp("I can't play music without a voice adapter")
  }

  const guild = client.guilds.cache.get(interaction.guildId)
  const member = guild?.members.cache.get(interaction.user.id)

  if (!member?.voice?.channelId) {
    return interaction.followUp(
      'Member is not in a voice channel, I guess (or something, idk man)',
    )
  }

  const connection = joinVoiceChannel({
    channelId: member.voice.channelId,
    guildId: interaction.guildId,
    adapterCreator: interaction.guild.voiceAdapterCreator,
  })

  setupConnectionEvents(connection)

  botRadioState.audioPlayer ??= createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Play,
    },
  })
  botRadioState.subscription = connection.subscribe(botRadioState.audioPlayer)

  await playStream(streamUrl)

  return interaction.followUp('👌🏻')
}

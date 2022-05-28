import type { CommandInteraction } from 'discord.js'
import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  PlayerSubscription,
  VoiceConnection,
  VoiceConnectionStatus,
} from '@discordjs/voice'
import signale from 'signale'
import play from 'play-dl'
import * as usetube from 'usetube'
import * as Sentry from '@sentry/node'

import { client } from '~/clients/bot/bot.client'
import { CachedPlayQueue } from '~/helpers/queue.helper'
import { BOT_CONNECTION_TIMEOUT } from '~/constants/time.constants'

export type BotVideoState = {
  isPlaying: boolean
  hasMountedErrorEvents: boolean
  audioPlayer?: AudioPlayer | null
  subscription?: PlayerSubscription | null
}

export const videosQueue = new CachedPlayQueue()
export const botVideoState: BotVideoState = {
  isPlaying: false,
  hasMountedErrorEvents: false,
  audioPlayer: null,
  subscription: null,
}
let botTimeout: NodeJS.Timeout | null = null

export function handlePlaying() {
  botVideoState.isPlaying = true

  if (botTimeout) {
    clearTimeout(botTimeout)
  }
}

export async function handleIdle(): Promise<void> {
  botVideoState.isPlaying = false

  if (videosQueue.isEmpty()) {
    botTimeout = setTimeout(() => {
      if (!botVideoState.isPlaying) {
        console.log('timing out')
        botVideoState.subscription?.connection.disconnect()
      }
    }, BOT_CONNECTION_TIMEOUT)
    return
  }

  const videoUrl = videosQueue.unshift()

  try {
    await playVideo(videoUrl)
  } catch (error) {
    signale.error('Failed to play video:', error)
    Sentry.captureException(error)
    return handleIdle()
  }
}

export function handleAudioPlayerError(error: Error) {
  signale.error({
    prefix: 'Audio player error',
    message: error.message,
  })
  Sentry.withScope(scope => {
    scope.setExtra('emitter', 'audioPlayer')
    Sentry.captureException(error)
  })
}

export async function playVideo(videoUrl: string) {
  const { stream, type: inputType } = await play.stream(videoUrl)
  const resource = createAudioResource(stream, {
    inputType,
  })

  if (botVideoState.audioPlayer) {
    if (!botVideoState.hasMountedErrorEvents) {
      botVideoState.audioPlayer?.on('error', handleAudioPlayerError)
      botVideoState.hasMountedErrorEvents = true
    }

    if (resource) {
      botVideoState.audioPlayer.play(resource)
      botVideoState.audioPlayer.on(AudioPlayerStatus.Playing, handlePlaying)
      botVideoState.audioPlayer.on(AudioPlayerStatus.Idle, handleIdle)
    }
  }
}

export function handleVideoQueueClear() {
  videosQueue.clear()
  botVideoState.isPlaying = false
  botVideoState.subscription?.connection.destroy()
}

export function handleDisconnect(error?: Error) {
  if (error) {
    Sentry.withScope(scope => {
      scope.setExtra('emitter', 'connection/process')
      Sentry.captureException(error)
    })
  }

  handleVideoQueueClear()
}

export function setupConnectionEvents(connection: VoiceConnection) {
  connection.on('error', handleVideoQueueClear)
  connection.on(VoiceConnectionStatus.Disconnected, () => {
    handleDisconnect()
  })
}

export async function createVideoAudioVoiceConnection(
  interaction: CommandInteraction,
  videoUrl: string,
  videoName = videoUrl,
) {
  if (botVideoState.isPlaying) {
    videosQueue.push(videoUrl)
    return interaction.followUp(`Video added to the queue 📭\n${videoName}`)
  }

  if (!interaction.guildId || !interaction.guild?.voiceAdapterCreator) {
    return interaction.followUp('You are not in a voice channel or something')
  }

  const guild = client.guilds.cache.get(interaction.guildId)
  const member = guild?.members.cache.get(interaction.user.id)

  if (!member?.voice?.channelId) {
    return interaction.followUp('You are not in a voice channel')
  }

  const connection = joinVoiceChannel({
    channelId: member.voice.channelId,
    guildId: interaction.guildId,
    adapterCreator: interaction.guild.voiceAdapterCreator,
  })

  setupConnectionEvents(connection)

  botVideoState.audioPlayer ??= createAudioPlayer()
  botVideoState.subscription = connection.subscribe(botVideoState.audioPlayer)

  try {
    await playVideo(videoUrl)
  } catch (error: any) {
    signale.error({
      prefix: 'Video play error',
      message: error.message,
    })
    Sentry.withScope(scope => {
      scope.setExtra('emitter', 'playVideo')
      Sentry.captureException(error)
    })
    return interaction.followUp('Something went wrong')
  }

  return interaction.followUp(`Now playing this stuff:\n${videoUrl}`)
}

export async function searchYouTubeUrl(
  interaction: CommandInteraction,
  input: string,
) {
  const { videos } = await usetube.searchVideo(input)

  const fetchedVideosMessageBody = videos
    .map((video, videoIndex) => `**[${videoIndex + 1}]**: ${video.title}`)
    .join('\n')

  if (!interaction.channel) {
    return
  }

  const sentVideosMessage = await interaction.channel.send(
    fetchedVideosMessageBody,
  )
  const collected = await interaction.channel.awaitMessages({
    max: 1,
    time: 30000,
    errors: ['time'],
  })
  const video = collected.first()

  if (video) {
    const videoIndex = Number(video.content) - 1
    const selectedVideo = videos[videoIndex]

    if (selectedVideo) {
      await sentVideosMessage.delete()
      return `https://www.youtube.com/watch?v=${selectedVideo.id}`
    }
  }
}

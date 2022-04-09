import type { AwaitMessagesOptions, CommandInteraction } from 'discord.js'
import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  PlayerSubscription,
  VoiceConnection,
} from '@discordjs/voice'
import signale from 'signale'
import play from 'play-dl'
import * as usetube from 'usetube'

import { client } from '../../client'

import { CachedPlayQueue } from './play.helpers'

type BotVideoState = {
  isPlaying: boolean
  hasMountedErrorEvents: boolean
  audioPlayer?: AudioPlayer
  subscription?: PlayerSubscription
}

export const videosQueue = new CachedPlayQueue()

export const botVideoState: BotVideoState = {
  isPlaying: false,
  hasMountedErrorEvents: false,
}

function handlePlaying() {
  botVideoState.isPlaying = true
}

async function handleIdle() {
  botVideoState.isPlaying = false
  if (!videosQueue.isEmpty()) {
    const videoUrl = videosQueue.unshift()
    await playVideo(videoUrl)
  }
}

function handleAudioPlayerError(error: Error) {
  const { message } = error

  signale.error({
    prefix: 'Audio player error error',
    message,
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

    if (resource && botVideoState.subscription) {
      botVideoState.audioPlayer.play(resource)
      botVideoState.subscription.player.on(
        AudioPlayerStatus.Playing,
        handlePlaying,
      )
      botVideoState.subscription.player.on(AudioPlayerStatus.Idle, handleIdle)
    }
  }
}

function setupConnectionEvents(connection: VoiceConnection) {
  const handleVideoQueueClear = () => {
    botVideoState.isPlaying = false
    videosQueue.clear()
  }

  const handleDisconnect = () => {
    handleVideoQueueClear()
    connection.destroy()
  }

  connection.on('error', handleVideoQueueClear)
  process.on('beforeExit', handleDisconnect)
  process.on('exit', handleDisconnect)
}

async function createVideoAudioVoiceConnection(
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

  botVideoState.audioPlayer = createAudioPlayer()
  botVideoState.subscription = connection.subscribe(botVideoState.audioPlayer)

  await playVideo(videoUrl)

  return interaction.followUp(`Now playing this stuff:\n${videoUrl}`)
}

async function searchYouTubeUrl(
  interaction: CommandInteraction,
  input: string,
) {
  const { videos } = await usetube.searchVideo(input)
  const filter: AwaitMessagesOptions = {
    max: 1,
    time: 30000,
    errors: ['time'],
  }

  const fetchedVideosMessageBody = videos
    .map((video, videoIndex) => `**[${videoIndex + 1}]**: ${video.title}`)
    .join('\n')

  if (!interaction.channel) {
    return
  }

  const sentVideosMessage = await interaction.channel.send(
    fetchedVideosMessageBody,
  )
  const collected = await interaction.channel.awaitMessages(filter)
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

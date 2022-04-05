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
  lastInteraction?: CommandInteraction
}

export const videosQueue = new CachedPlayQueue()

export const botVideoState: BotVideoState = {
  isPlaying: false,
  hasMountedErrorEvents: false,
}

function handlePlaying() {
  botVideoState.isPlaying = true
}

function handlePause() {
  if (botVideoState.lastInteraction?.isCommand()) {
    botVideoState.lastInteraction.reply('Video is paused, dawg')
  }
}

function handleIdle() {
  botVideoState.isPlaying = false
  if (!videosQueue.isEmpty()) {
    const videoUrl = videosQueue.unshift()
    playVideo(videoUrl)
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
      botVideoState.subscription.player.on(
        AudioPlayerStatus.Paused,
        handlePause,
      )
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

async function createVideoPlayingConnection(
  interaction: CommandInteraction,
  videoUrl: string,
) {
  if (botVideoState.isPlaying) {
    videosQueue.push(videoUrl)
    return interaction.reply('Video added to the queue')
  }

  if (!interaction.guildId || !interaction.user.client.voice) {
    return interaction.reply('You need to be in a voice channel to play music')
  }

  if (!interaction.guild?.voiceAdapterCreator) {
    return interaction.reply("I can't play music without a voice adapter")
  }

  const guild = client.guilds.cache.get(interaction.guildId)

  if (!guild) {
    return interaction.reply("I can't find this guild lul")
  }

  const member = guild.members.cache.get(interaction.user.id)

  if (!member?.voice?.channelId) {
    return interaction.reply(
      'Member is not in a voice channel, I guess (or something, idk man)',
    )
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

  const videosMessages = videos
    .map((video, videoIndex) => `**[${videoIndex + 1}]**: ${video.title}`)
    .join('\n')

  if (!interaction.channel) {
    return
  }

  await interaction.reply(videosMessages)

  const collected = await interaction.channel.awaitMessages(filter)
  const video = collected.first()

  if (video) {
    const videoIndex = Number(video.content) - 1
    const selectedVideo = videos[videoIndex]

    if (selectedVideo) {
      return `https://www.youtube.com/watch?v=${selectedVideo.id}`
    }
  }
}

export async function playEventHandler(interaction: CommandInteraction) {
  botVideoState.lastInteraction = interaction

  const videoUrl = interaction.options.getString('url')

  if (videoUrl) {
    const youtubeUrlMatch = /youtube\.com/g
    const isYouTubeUrl = youtubeUrlMatch.test(videoUrl)

    if (isYouTubeUrl) {
      return await createVideoPlayingConnection(interaction, videoUrl)
    }
  }

  const search = interaction.options.getString('search') ?? ''
  const isEmptyInput = !videoUrl && !search

  if (isEmptyInput) {
    return interaction.reply('You need to provide a video url or search query')
  }

  const searchedUrl = await searchYouTubeUrl(interaction, search)

  if (searchedUrl) {
    return await createVideoPlayingConnection(interaction, searchedUrl)
  }

  return interaction.reply('Invalid video url, homie')
}

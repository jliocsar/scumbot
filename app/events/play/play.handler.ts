import type { AwaitMessagesOptions, Message } from 'discord.js'
import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  PlayerSubscription,
  VoiceConnection,
} from '@discordjs/voice'
import ytdl from 'discord-ytdl-core'
import usetube from 'usetube'

import { CachedPlayQueue } from './play.helpers'

type BotVideoState = {
  isPlaying: boolean
  audioPlayer?: AudioPlayer
  subscription?: PlayerSubscription
  lastMessage?: Message
}

export const videosQueue = new CachedPlayQueue()

export const botVideoState: BotVideoState = {
  isPlaying: false,
}

function handlePlaying() {
  botVideoState.isPlaying = true
}

function handlePause() {
  if (botVideoState.lastMessage) {
    botVideoState.lastMessage.reply('Video is paused, dawg')
  }
}

function handleIdle() {
  botVideoState.isPlaying = false
  if (!videosQueue.isEmpty()) {
    const videoUrl = videosQueue.unshift()
    playVideo(videoUrl)
  }
}

export function playVideo(videoUrl: string) {
  const buffer = ytdl(videoUrl, {
    filter: 'audioonly',
    opusEncoded: false,
    fmt: 'mp3',
    encoderArgs: ['-af', 'bass=g=10,dynaudnorm=f=200'],
  })
  const resource = createAudioResource(buffer)

  if (resource && botVideoState.subscription && botVideoState.audioPlayer) {
    botVideoState.audioPlayer.play(resource)

    botVideoState.subscription.player.on(
      AudioPlayerStatus.Playing,
      handlePlaying,
    )
    botVideoState.subscription.player.on(AudioPlayerStatus.Idle, handleIdle)
    botVideoState.subscription.player.on(AudioPlayerStatus.Paused, handlePause)
  }
}

function setupConnectionEvents(connection: VoiceConnection) {
  const handleDisconnect = () => {
    videosQueue.clear()
    connection.destroy()
  }

  connection.on('error', videosQueue.clear)
  process.on('beforeExit', handleDisconnect)
  process.on('exit', handleDisconnect)
}

async function createVideoPlayingConnection(
  message: Message,
  videoUrl: string,
) {
  if (botVideoState.isPlaying) {
    videosQueue.push(videoUrl)
    return message.reply('Video added to the queue')
  }

  if (!message.guildId || !message?.member?.voice?.channelId) {
    return message.reply('You need to be in a voice channel to play music')
  }

  if (!message?.guild?.voiceAdapterCreator) {
    return message.reply("I can't play music without a voice adapter")
  }

  const connection = joinVoiceChannel({
    channelId: message.member.voice.channelId,
    guildId: message.guildId,
    adapterCreator: message.guild.voiceAdapterCreator,
  })

  setupConnectionEvents(connection)

  botVideoState.audioPlayer = createAudioPlayer()
  botVideoState.subscription = connection.subscribe(botVideoState.audioPlayer)

  playVideo(videoUrl)
}

async function searchYouTubeUrl(message: Message, input: string) {
  const { videos } = await usetube.searchVideo(input)
  const filter: AwaitMessagesOptions = {
    max: 1,
    time: 30000,
    errors: ['time'],
  }

  const videosMessages = videos
    .map((video, videoIndex) => `**[${videoIndex + 1}]**: ${video.title}`)
    .join('\n')

  await message.reply(videosMessages)

  const collected = await message.channel.awaitMessages(filter)
  const video = collected.first()

  if (video) {
    const videoIndex = Number(video.content) - 1
    const selectedVideo = videos[videoIndex]

    if (selectedVideo) {
      return `https://www.youtube.com/watch?v=${selectedVideo.id}`
    }

    return undefined
  }
}

export async function playEventHandler(
  message: Message,
  videoUrlOrSearch: string,
  ...searchRest: string[]
) {
  botVideoState.lastMessage = message

  if (!videoUrlOrSearch) {
    message.reply('You need to provide a video url')
    return
  }

  const youtubeUrlMatch = /youtube\.com/g
  const isYoutubeUrl = youtubeUrlMatch.test(videoUrlOrSearch)

  if (isYoutubeUrl) {
    await createVideoPlayingConnection(message, videoUrlOrSearch)
    return
  }

  const searchTerms = [videoUrlOrSearch, ...searchRest].join(' ')
  const searchedUrl = await searchYouTubeUrl(message, searchTerms)

  if (searchedUrl) {
    await createVideoPlayingConnection(message, searchedUrl)
    return
  }

  await message.reply('Invalid video url, homie')
}

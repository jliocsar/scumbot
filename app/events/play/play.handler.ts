import type { Message } from 'discord.js'
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

import { CachedPlayQueue } from './play.helpers'

type BotVideoState = {
  isPlaying: boolean
  audioPlayer: AudioPlayer | undefined
  subscription: PlayerSubscription | undefined
}

export const videosQueue = new CachedPlayQueue()

export const botVideoState: BotVideoState = {
  isPlaying: false,
  audioPlayer: undefined,
  subscription: undefined,
}

function handlePlaying() {
  botVideoState.isPlaying = true
}

function handlePause() {
  console.log('paused')
}

function handleIdle() {
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
  process.on('beforeExit', connection.destroy)

  process.on('exit', () => {
    process.off('beforeExit', connection.destroy)
  })
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

export async function playEventHandler(
  message: Message,
  videoUrlOrName: string,
) {
  const isUrl = videoUrlOrName.startsWith('https://')

  if (isUrl) {
    await createVideoPlayingConnection(message, videoUrlOrName)
    return
  }

  await message.reply('Invalid video url, homie')
}

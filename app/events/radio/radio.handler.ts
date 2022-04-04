import type { Message } from 'discord.js'
import {
  AudioPlayer,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  NoSubscriberBehavior,
  PlayerSubscription,
  StreamType,
  VoiceConnection,
} from '@discordjs/voice'

type BotRadioState = {
  isPlaying: boolean
  hasMountedErrorEvents: boolean
  audioPlayer?: AudioPlayer
  subscription?: PlayerSubscription
  lastMessage?: Message
}

export const botRadioState: BotRadioState = {
  isPlaying: false,
  hasMountedErrorEvents: false,
}

async function playStream(streamUrl: string) {
  const resource = createAudioResource(streamUrl, {
    inputType: StreamType.OggOpus,
  })

  if (botRadioState.audioPlayer) {
    botRadioState.audioPlayer.play(resource)
  }
}

function setupConnectionEvents(connection: VoiceConnection) {
  const handleStreamPlayingStop = () => {
    botRadioState.isPlaying = false
  }

  const handleDisconnect = () => {
    handleStreamPlayingStop()
    connection.destroy()
  }

  connection.on('error', handleDisconnect)
  process.on('beforeExit', handleDisconnect)
  process.on('exit', handleDisconnect)
}

async function createStreamPlayingConnection(
  message: Message,
  streamUrl: string,
) {
  if (!message.guildId || !message.member?.voice.channelId) {
    return message.reply('You need to be in a voice channel to play music')
  }

  if (!message.guild?.voiceAdapterCreator) {
    return message.reply("I can't play music without a voice adapter")
  }

  if (!botRadioState.audioPlayer) {
    botRadioState.audioPlayer = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play,
      },
    })
  }

  const connection = joinVoiceChannel({
    channelId: message.member.voice.channelId,
    guildId: message.guildId,
    adapterCreator: message.guild.voiceAdapterCreator,
  })

  setupConnectionEvents(connection)

  botRadioState.subscription = connection.subscribe(botRadioState.audioPlayer)

  await playStream(streamUrl)
}

export async function radioEventHandler(message: Message, streamUrl: string) {
  botRadioState.lastMessage = message
  botRadioState.isPlaying = true

  const isValidUrl = /^http?s:\/\//.test(streamUrl)

  if (isValidUrl) {
    return await createStreamPlayingConnection(message, streamUrl)
  }

  return message.reply('Not a valid URL, homie')
}

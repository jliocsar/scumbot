import type { CommandInteraction } from 'discord.js'
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

import { client } from '../../client'

import { botVideoState } from '../play'

type BotRadioState = {
  isPlaying: boolean
  hasMountedErrorEvents: boolean
  audioPlayer?: AudioPlayer
  subscription?: PlayerSubscription
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
  interaction: CommandInteraction,
  streamUrl: string,
) {
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

  if (!botRadioState.audioPlayer) {
    botRadioState.audioPlayer = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play,
      },
    })
  }

  const connection = joinVoiceChannel({
    channelId: member.voice.channelId,
    guildId: interaction.guildId,
    adapterCreator: interaction.guild.voiceAdapterCreator,
  })

  setupConnectionEvents(connection)

  botRadioState.subscription = connection.subscribe(botRadioState.audioPlayer)

  await playStream(streamUrl)
}

export async function radioEventHandler(interaction: CommandInteraction) {
  const streamingUrl = interaction.options.getString('url')

  if (!streamingUrl) {
    return interaction.reply('You need to provide a video url')
  }

  if (botVideoState.isPlaying) {
    return interaction.reply('There is a video playing already')
  }

  botRadioState.isPlaying = true

  const isValidUrl = /^http?s:\/\//.test(streamingUrl)

  if (isValidUrl) {
    return await createStreamPlayingConnection(interaction, streamingUrl)
  }

  return interaction.reply('Not a valid URL, homie')
}

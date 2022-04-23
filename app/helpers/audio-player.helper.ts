import {
  AudioPlayerStatus,
  createAudioPlayer as createDiscordAudioPlayer,
} from '@discordjs/voice'

import {
  botVideoState,
  handleDisconnect as handleVideoPlayingDisconnect,
} from '~/events/play'
import {
  botRadioState,
  handleDisconnect as handleRadioDisconnect,
} from '~/events/radio'

const MINUTE = 60_000

export function createAudioPlayer() {
  const audioPlayer = createDiscordAudioPlayer()

  audioPlayer.on(AudioPlayerStatus.Idle, () => {
    setTimeout(() => {
      if (!botVideoState.isPlaying) {
        return handleVideoPlayingDisconnect()
      }

      if (!botRadioState.isPlaying) {
        return handleRadioDisconnect()
      }
    }, MINUTE * 5)
  })

  return audioPlayer
}

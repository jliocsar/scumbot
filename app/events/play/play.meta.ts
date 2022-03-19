import type { CommandMeta } from '../../types/events.types'
import { Command } from '../../constants/commands.constants'

export const playMeta: CommandMeta = {
  name: Command.Play,
  type: 1,
  description: 'Plays a video',
  options: [
    {
      name: 'url',
      description: 'The url of the video to play',
      type: 1,
      required: true,
      choices: [],
    },
  ],
}

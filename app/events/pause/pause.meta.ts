import type { CommandMeta } from '../../types/events.types'
import { Command } from '../../constants/commands.constants'

export const pauseMeta: CommandMeta = {
  name: Command.Pause,
  type: 1,
  description: 'Pauses the current video',
  options: [],
}

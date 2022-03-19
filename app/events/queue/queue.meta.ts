import type { CommandMeta } from '../../types/events.types'
import { Command } from '../../constants/commands.constants'

export const queueMeta: CommandMeta = {
  name: Command.Queue,
  type: 1,
  description: 'Outputs the current queue of videos',
  options: [],
}

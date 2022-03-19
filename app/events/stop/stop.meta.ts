import type { CommandMeta } from '../../types/events.types'
import { Command } from '../../constants/commands.constants'

export const stopMeta: CommandMeta = {
  name: Command.Stop,
  type: 1,
  description: 'Stops the current video',
  options: [],
}

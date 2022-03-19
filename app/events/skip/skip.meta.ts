import type { CommandMeta } from '../../types/events.types'
import { Command } from '../../constants/commands.constants'

export const skipMeta: CommandMeta = {
  name: Command.Skip,
  type: 1,
  description: 'Skips the current video',
  options: [],
}

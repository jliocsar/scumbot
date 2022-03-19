import type { CommandMeta } from '../../types/events.types'
import { Command } from '../../constants/commands.constants'

export const resumeMeta: CommandMeta = {
  name: Command.Resume,
  type: 1,
  description: 'Resumes the currently paused video',
  options: [],
}

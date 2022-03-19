import type { EventMap } from '../types/events.types'
import { Command } from '../constants/commands.constants'

import { playEventHandler } from './play'
import { skipEventHandler } from './skip'
import { stopEventHandler } from './stop'
import { queueEventHandler } from './queue'

export const eventMap: EventMap = {
  [Command.Play]: playEventHandler,
  [Command.Skip]: skipEventHandler,
  [Command.Stop]: stopEventHandler,
  [Command.Queue]: queueEventHandler,
}

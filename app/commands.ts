import { pauseCommand } from './events/pause'
import { playCommand } from './events/play'
import { queueCommand } from './events/queue'
import { radioCommand } from './events/radio'
import { resumeCommand } from './events/resume'
import { skipCommand } from './events/skip'
import { stopCommand } from './events/stop'

export const commands = [
  pauseCommand,
  playCommand,
  queueCommand,
  radioCommand,
  resumeCommand,
  skipCommand,
  stopCommand,
]

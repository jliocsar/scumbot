import { pauseMeta } from './pause'
import { playMeta } from './play'
import { queueMeta } from './queue'
import { resumeMeta } from './resume'
import { skipMeta } from './skip'
import { stopMeta } from './stop'

export const eventsMeta = [
  pauseMeta,
  resumeMeta,
  playMeta,
  queueMeta,
  skipMeta,
  stopMeta,
]

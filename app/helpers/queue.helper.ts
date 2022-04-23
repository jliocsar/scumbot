import { StoreKey } from '~/constants/store.constants'
import { store } from '~/store'

export class CachedPlayQueue {
  get queue() {
    return store.get(StoreKey.PlayQueue) as string[]
  }

  push(videoUrl: string) {
    const queue = this.queue
    store.set(StoreKey.PlayQueue, [...queue, videoUrl])
    return queue
  }

  unshift() {
    if (this.isEmpty()) {
      throw new Error('The queue is empty')
    }

    const [videoUrl, ...queueTail] = this.queue
    store.set(StoreKey.PlayQueue, queueTail)
    return videoUrl
  }

  isEmpty() {
    return !this.queue.length
  }

  clear() {
    store.set(StoreKey.PlayQueue, [])
  }
}

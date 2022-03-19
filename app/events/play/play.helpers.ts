import { StoreKey } from '../../constants/store.constants'
import { store } from '../../store'

export class CachedPlayQueue {
  public get queue() {
    return store.get<string[]>(StoreKey.PlayQueue) as string[]
  }

  public push(videoUrl: string) {
    const queue = this.queue
    store.set(StoreKey.PlayQueue, [...queue, videoUrl])
    return queue
  }

  public unshift() {
    if (this.isEmpty()) {
      throw new Error('The queue is empty')
    }

    const [videoUrl, ...queueTail] = this.queue
    store.set(StoreKey.PlayQueue, queueTail)
    return videoUrl
  }

  public isEmpty() {
    return !this.queue.length
  }
}

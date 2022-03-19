import NodeCache from 'node-cache'

import { StoreKey } from './constants/store.constants'

function setDefaultCache(store: NodeCache) {
  store.set<string[]>(StoreKey.PlayQueue, [])
}

function createStore() {
  const store = new NodeCache()
  setDefaultCache(store)
  return store
}

export const store = createStore()

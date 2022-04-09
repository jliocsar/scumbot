import signale from 'signale'

import { client } from './client/discord'
import { DISCORD_TOKEN } from './constants/environment.constants'

function handleReady() {
  signale.success('Client is ready as', client?.user?.tag)
}

function handleError(error: Error) {
  signale.error('Client error:', error)
}

function handleWarning(warning: string) {
  signale.warn('Client warning:', warning)
}

function handleDisconnect() {
  signale.warn('Client disconnected')
}

function handleReconnecting() {
  signale.warn('Client disconnected')
}

function setupClientEvents() {
  client.on('ready', handleReady)
  client.on('error', handleError)
  client.on('warn', handleWarning)
  client.on('disconnect', handleDisconnect)
  client.on('reconnecting', handleReconnecting)
}

export async function setupClient() {
  setupClientEvents()
  await client.login(DISCORD_TOKEN)
  return client
}

import signale from 'signale'
import * as Sentry from '@sentry/node'

import { client } from './clients/bot/bot.client'
import { DISCORD_TOKEN } from './constants/environment.constants'

function handleReady() {
  signale.success('Client is ready as', client?.user?.tag)
}

function handleError(error: Error) {
  signale.error('Client error:', error)
  Sentry.withScope(scope => {
    scope.setExtra('emitter', 'client')
    Sentry.captureException(error)
  })
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

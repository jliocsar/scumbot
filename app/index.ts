import 'dotenv-safe/config'
import type { Client } from 'discord.js'
import signale from 'signale'
import axios from 'axios'

import { createClient } from './client'
import { setupClientEvents } from './events'

/*********************
 * Hacky keep-alive
 * Get rid of this later!
 ***********************/
const MINUTE = 60 * 1000
const BACON_IPSUM_API_URL = 'https://baconipsum.com/api/'
const axiosClient = axios.create({ baseURL: BACON_IPSUM_API_URL })
const customLogger = new signale.Signale({
  types: {
    bacon: {
      badge: '🍖',
      color: 'red',
      label: 'bacon',
      logLevel: 'info',
    },
  },
})
function keepBotAlive() {
  setInterval(async () => {
    const { data } = await axiosClient.get('/', {
      params: {
        type: 'meat-and-filler',
        paras: 1,
      },
    })
    const [quote] = data

    customLogger.bacon('Keeping the bot alive with bacon:', quote)
  }, MINUTE / 2)
}
keepBotAlive()
/*********************
 * Hacky keep-alive
 * Get rid of this later!
 ***********************/

function setupClient(client: Client) {
  client.on('ready', () => {
    signale.success('Client ready as', client?.user?.tag)
  })

  return client
}

async function startDiscordBot() {
  const client = await createClient(setupClient)
  await setupClientEvents(client)
}

startDiscordBot()

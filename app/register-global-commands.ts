import axios from 'axios'
import signale from 'signale'

import {
  APPLICATION_ID,
  DISCORD_TOKEN,
} from './constants/environment.constants'
import { eventsMeta } from './events/events-meta'

export async function registerGlobalCommands() {
  const axiosClient = axios.create({
    baseURL: `https://discord.com/api/v8/applications/${APPLICATION_ID}`,
  })

  const headers = {
    Authorization: `Bot ${DISCORD_TOKEN}`,
  }

  await Promise.all(
    eventsMeta.map(async eventMeta => {
      try {
        const { data } = await axiosClient.post('/commands', eventMeta, {
          headers,
        })

        if (!data?.id) {
          throw new Error('No id returned from registering command')
        }
      } catch (error: any) {
        signale.error(error.response.data)
      }
    }),
  )
}

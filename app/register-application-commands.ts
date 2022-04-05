import signale from 'signale'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'

import {
  APPLICATION_ID,
  DISCORD_TOKEN,
} from './constants/environment.constants'
import { client } from './client'
import { commands } from './commands'

export async function registerApplicationCommands() {
  try {
    const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN)
    const guilds = await client.guilds.fetch()

    await Promise.all(
      guilds.map(async guild => {
        try {
          await rest.put(
            Routes.applicationGuildCommands(APPLICATION_ID, guild.id),
            {
              body: commands,
            },
          )
          signale.success('Registered commands for guild:', guild.name)
        } catch (error) {
          console.log({ error })
          signale.error('Failed to register commands in', guild.name)
        }
      }),
    )
  } catch (error) {
    console.error(error)
  }
}

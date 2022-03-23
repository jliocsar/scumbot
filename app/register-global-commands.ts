import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { SlashCommandBuilder } from '@discordjs/builders'

import {
  APPLICATION_ID,
  DISCORD_TOKEN,
} from './constants/environment.constants'
import { client } from './client'

const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN)

export async function registerGlobalCommands() {
  try {
    const guilds = await client.guilds.fetch()
    const testCommand = new SlashCommandBuilder()
      .setName('test')
      .setDescription('Test command')
      .toJSON()

    await Promise.all(
      guilds.map(guild => {
        return rest.put(
          Routes.applicationGuildCommands(APPLICATION_ID, guild.id),
          {
            headers: {
              Authorization: `Bot ${DISCORD_TOKEN}`,
            },
            body: [testCommand],
          },
        )
      }),
    )
  } catch (error) {
    console.error(error)
  }
}

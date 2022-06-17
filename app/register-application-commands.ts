import type { OAuth2Guild } from 'discord.js'
import { Routes } from 'discord-api-types/v9'
import signale from 'signale'

import { APPLICATION_ID, CUSTOM_GUILD } from './constants/environment.constants'
import { client } from './clients/bot/bot.client'
import { rest } from './clients/rest/rest.client'
import { commands } from './commands'

export const GUILDS_FROM_GURIS = [
  CUSTOM_GUILD,
  '🏡 AUXILIADORA FUNDOS 🌅',
  'game + makonha',
  'PROERD Galático',
]

const filterGuild = (guild: OAuth2Guild) =>
  GUILDS_FROM_GURIS.includes(guild.name)

const registerApplicationCommand = async (guild: OAuth2Guild) => {
  try {
    await rest.put(Routes.applicationGuildCommands(APPLICATION_ID, guild.id), {
      body: commands,
    })
    signale.success('Registered commands for guild:', guild.name)
  } catch (error) {
    signale.error('Failed to register commands in', guild.name)
  }
}

export async function registerApplicationCommands() {
  try {
    const guilds = await client.guilds.fetch()
    await Promise.all(
      guilds.filter(filterGuild).map(registerApplicationCommand),
    )
  } catch (error) {
    signale.error('Something went wrong on fetching the guilds:', error)
  }
}

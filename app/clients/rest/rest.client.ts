import { REST } from '@discordjs/rest'

import { DISCORD_TOKEN } from '~/constants/environment.constants'

export const rest = new REST({
  version: '9',
}).setToken(DISCORD_TOKEN)

import { SlashCommandBuilder } from '@discordjs/builders'

export const stopCommand = new SlashCommandBuilder()
  .setName('stop')
  .setDescription('Stops the current video/radio')
  .toJSON()

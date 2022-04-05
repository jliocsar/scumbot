import { SlashCommandBuilder } from '@discordjs/builders'

export const queueCommand = new SlashCommandBuilder()
  .setName('queue')
  .setDescription('Prints the current queue')
  .toJSON()

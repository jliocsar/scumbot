import { SlashCommandBuilder } from '@discordjs/builders'

export const skipCommand = new SlashCommandBuilder()
  .setName('skip')
  .setDescription('Skips the current video in the queue')
  .toJSON()

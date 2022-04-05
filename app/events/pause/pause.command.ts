import { SlashCommandBuilder } from '@discordjs/builders'

export const pauseCommand = new SlashCommandBuilder()
  .setName('pause')
  .setDescription('Pauses the current song until `/resume` is used')
  .toJSON()

import {
  SlashCommandBuilder,
  SlashCommandStringOption,
} from '@discordjs/builders'

export const radioCommandOptions = new SlashCommandStringOption()
  .setName('url')
  .setDescription('URL of a radio streaming')
  .setRequired(true)

export const radioCommand = new SlashCommandBuilder()
  .setName('radio')
  .setDescription('Plays radio streaming')
  .addStringOption(radioCommandOptions)
  .toJSON()

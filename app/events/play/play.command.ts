import {
  SlashCommandBuilder,
  SlashCommandStringOption,
} from '@discordjs/builders'

export const urlPlayCommandOption = new SlashCommandStringOption()
  .setName('url')
  .setDescription('YouTube URL of the song to play')
  .setRequired(false)

export const searchPlayCommandOption = new SlashCommandStringOption()
  .setName('search')
  .setDescription('Terms to search on YouTube')
  .setRequired(false)

export const playCommand = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Plays a song based on a YouTube URL or search term')
  .addStringOption(urlPlayCommandOption)
  .addStringOption(searchPlayCommandOption)
  .toJSON()

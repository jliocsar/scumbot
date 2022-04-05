import { SlashCommandBuilder } from '@discordjs/builders'

export const resumeCommand = new SlashCommandBuilder()
  .setName('resume')
  .setDescription('Resumes the current video')
  .toJSON()

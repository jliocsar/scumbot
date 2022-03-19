import type { Message } from 'discord.js'

import { videosQueue } from '../play'

export async function queueEventHandler(message: Message) {
  await message.reply(JSON.stringify(videosQueue))
}

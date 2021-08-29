import { Telegraf } from 'telegraf'
import { BotCommand } from 'typegram'

import start from './start'
import today from './tungshing'

const handlers: Array<(bot: Telegraf) => BotCommand[]> = [
  start,
  today
]

export default async function handle (bot: Telegraf): Promise<void> {
  await bot.telegram.setMyCommands(
    handlers.flatMap(handler => handler(bot))
  )
}

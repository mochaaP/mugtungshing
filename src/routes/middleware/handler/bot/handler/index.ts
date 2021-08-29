import { Telegraf } from 'telegraf'
import { BotCommand } from 'typegram'
import { ExtraEvent } from '../../../..'

import start from './start'
import today from './tungshing'

const handlers: Array<(bot: Telegraf, event: ExtraEvent) => BotCommand[]> = [
  start,
  today
]

export default async function handle (bot: Telegraf, event: ExtraEvent): Promise<void> {
  await bot.telegram.setMyCommands(
    handlers.flatMap(handler => handler(bot, event))
  )
}

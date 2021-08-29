import { Telegraf } from 'telegraf'

import start from './start'
import today from './today'

const handlers: Array<(bot: Telegraf) => void> = [
  start,
  today
]

export default function handle (bot: Telegraf): void {
  handlers.forEach(handler => handler(bot))
}

import { Telegraf, Markup } from 'telegraf'
import { BotCommand } from 'typegram'
import { ExtraEvent } from '../../../..'
import { Logger } from '../../../../../utils'

export default (bot: Telegraf, event: ExtraEvent): BotCommand[] => {
  const { log } = event.extra.logger as Logger

  bot.start(async (context) => {
    log('handling command /start')
    return await context.reply(`
<strong>(｡･∀･)ﾉﾞ 嗨！我是黄历姬，为你生成今日音游运势。</strong>

你可以用以下两种方法调用我：
- 指令：在任意有我的聊天里输入 /today
- 内联：在聊天框里输入 <code>@${(await context.telegram.getMe()).username ?? 'mugtungshing_bot'} </code>
    `, {
      parse_mode: 'HTML',
      reply_to_message_id: context.message.message_id,
      ...Markup.inlineKeyboard([
        Markup.button.switchToCurrentChat('生成我的今日音游黄历！', '')
      ])
    })
  })

  return [{
    command: 'start',
    description: '- 音游狗老黄历 Bot 使用说明。'
  }]
}

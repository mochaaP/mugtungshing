import { Telegraf, Markup } from 'telegraf'
import { getTungshing, getNickname, pangu, hash } from '../../../utils'

const timezone = 'Asia/Shanghai'

export default (bot: Telegraf): void => {
  bot.command('today', async (context) => {
    return await context.reply(
      await getTungshing(context.message.from, timezone),
      {
        parse_mode: 'HTML',
        reply_to_message_id: context.message.message_id,
        ...Markup.inlineKeyboard([
          Markup.button.switchToCurrentChat('给我也整一个！', '')
        ])
      }
    )
  })
  bot.on('inline_query', async (context) => {
    const tungshingResult = await getTungshing(
      context.inlineQuery.from,
      timezone
    )

    return await context.answerInlineQuery(
      [{
        type: 'article',
        id: (await hash(tungshingResult)).slice(0, 7),
        title: `📅 ${getNickname(context.inlineQuery.from)} 的今日黄历`,
        description: `查询 ${pangu.spacing(new Date().toLocaleDateString('zh-CN', { dateStyle: 'full', timeZone: timezone }))}的音游黄历`,
        input_message_content: {
          message_text: tungshingResult,
          parse_mode: 'HTML'
        },
        thumb_url: 'https://avatars.githubusercontent.com/u/88090726',
        ...Markup.inlineKeyboard([
          Markup.button.switchToCurrentChat('给我也整一个！', '')
        ])
      }],
      {
        cache_time: 30,
        is_personal: true
      }
    )
  })
}

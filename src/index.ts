import { Telegraf, Extra, Markup } from 'telegraf'
import { User } from 'typegram/manage'
import { Application, Router } from '@cfworker/web'
import createTelegrafMiddware from 'cfworker-middware-telegraf'

import { sentryLogging, sentry, newRelicLogging, relic, telegrafStatistic } from './statistics'
import getTungshing from './tungshing'

const bot = new Telegraf(BOT_TOKEN)

bot.use(telegrafStatistic)

bot.start(async (ctx) => {
  sentry.addBreadcrumb({
    message: 'received start command',
    category: 'log'
  })
  relic.add('received start command')
  return await ctx.reply(`
<strong>(｡･∀･)ﾉﾞ 嗨！我是黄历姬，为你生成今日音游运势。</strong>

你可以用以下两种方法调用我：
- 指令：在任意有我的聊天里输入 /today
- 内联：在聊天框里输入 <code>@${(await ctx.telegram.getMe()).username ?? 'mugtungshing_bot'} </code>
  `, Extra
    .HTML()
    .inReplyTo(ctx.update.message.message_id)
    .markup(Markup.inlineKeyboard([
      Markup.switchToCurrentChatButton('生成我的今日音游黄历！', '')
    ])))
})

bot.command('today', async (ctx) => {
  sentry.addBreadcrumb({
    message: 'received today command',
    category: 'log'
  })
  relic.add('received today command')
  return await ctx.reply(getTungshing(
    `${ctx.update.message.from.id}$${BOT_TOKEN}`,
    getNickname(ctx.update.message.from)
  ),
  Extra
    .HTML()
    .inReplyTo(ctx.update.message.message_id)
    .markup(
      Markup.inlineKeyboard([
        Markup.switchToCurrentChatButton('给我也整一个！', '')
      ])
    )
  )
})

bot.on('inline_query', async (ctx) => {
  sentry.addBreadcrumb({
    message: 'received inline query',
    category: 'log'
  })
  relic.add('received inline query')

  function str2ab (str: string): ArrayBuffer {
    var array = new Uint8Array(str.length)
    for (var i = 0; i < str.length; i++) {
      array[i] = str.charCodeAt(i)
    }
    return array.buffer
  }

  const tungshingResult = getTungshing(
    `${ctx.update.message.from.id}$${BOT_TOKEN}`,
    getNickname(ctx.update.message.from)
  )

  return await ctx.answerInlineQuery(
    [{
      type: 'article',
      id: new TextDecoder('utf8')
        .decode(
          new Uint8Array(
            await crypto.subtle.digest(
              'SHA-512',
              str2ab(tungshingResult)
            )
          )
        ),
      title: `📅 ${getNickname(ctx.update.inline_query.from)} 的今日黄历`,
      description: `查询${new Date().toLocaleDateString('zh-CN', { dateStyle: 'full', timeZone: 'Asia/Shanghai' })}的音游黄历`,
      input_message_content: {
        message_text: tungshingResult,
        parse_mode: 'HTML'
      }
    }],
    {
      cache_time: 30,
      is_personal: true
    }
  )
})

bot.on('chosen_inline_result', async (ctx) => {
  sentry.addBreadcrumb({
    message: 'inline result was chosen',
    category: 'log'
  })
  relic.add('inline result was chosen')
})

function getNickname (from: User): string {
  var name = from.first_name
  if (from.last_name != null) {
    name += ` ${from.last_name}`
  }

  return name
}

const router = new Router()
router.post(`/webhook/${BOT_PATH}`, async (context, next) => {
  bot.options.username = (await bot.telegram.getMe()).username
  return createTelegrafMiddware(bot)(context, next)
})
router.get('/setWebhook', async ({ req, res }) => {
  const url = req.url
  url.pathname = `/webhook/${BOT_PATH}`

  res.type = 'application/json'
  sentry.addBreadcrumb({
    message: 'setting webhook',
    category: 'log'
  })
  relic.add('setting webhook')
  try {
    await bot.telegram.setWebhook(url.toString())
    res.body = JSON.stringify({
      message: 'Bot launched'
    })
  } catch (e) {
    res.status = 500
    res.body = JSON.stringify({
      message: e.message
    })
    throw e
  }
})
new Application()
  .use(sentryLogging)
  .use(newRelicLogging)
  .use(router.middleware)
  .listen()

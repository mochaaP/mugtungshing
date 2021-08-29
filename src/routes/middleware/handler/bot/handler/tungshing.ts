import { Identifier } from '@mugtungshing/core'
import dayjs from 'dayjs'
import { Telegraf, Markup } from 'telegraf'
import { BotCommand, InlineQueryResult, User } from 'typegram'
import { ExtraEvent } from '../../../..'
import { getTungshingByUser, getNickname, pangu, hash, isToday, getTungshingByIdentifier, Logger } from '../../../../../utils'

const timezone = 'Asia/Shanghai'

const baguaRegExp = /^[乾兑地坎坤天山巽水泽火离艮雷震风]{8}·[乾兑地坎坤天山巽水泽火离艮雷震风]{4}·[乾兑地坎坤天山巽水泽火离艮雷震风]{4}·[乾兑地坎坤天山巽水泽火离艮雷震风]{4}·[乾兑地坎坤天山巽水泽火离艮雷震风]{12}$/
const identifierRegExp = /^[乾兑地坎坤天山巽水泽火离艮雷震风a-f0-9]{8}[·-][乾兑地坎坤天山巽水泽火离艮雷震风a-f0-9]{4}[·-][乾兑地坎坤天山巽水泽火离艮雷震风a-f0-9]{4}[·-][乾兑地坎坤天山巽水泽火离艮雷震风a-f0-9]{4}[·-][乾兑地坎坤天山巽水泽火离艮雷震风a-f0-9]{12}$/
const dateRegExp = /^(\d{4})(\d{2})(\d{2})$/

export default (bot: Telegraf, event: ExtraEvent): BotCommand[] => {
  const { log } = event.extra.logger as Logger

  bot.command('tungshing', async (context) => {
    log('Handling command /tungshing', undefined, context.message)
    const parsed = context.message.text.split(' ')
    if (parsed[1]?.match(identifierRegExp) != null) {
      log('identifier found at first argument', undefined, parsed[1])
      return await context.reply(
        await getTungshingByIdentifier(new Identifier(parsed[1]), timezone),
        {
          parse_mode: 'HTML',
          reply_to_message_id: context.message.message_id,
          ...Markup.inlineKeyboard([
            Markup.button.switchToCurrentChat('给我也整一个！', '')
          ])
        }
      )
    } else if (parsed[1] != null && dayjs(parsed[1]).isValid() && dayjs.tz(parsed[1], timezone).diff(dayjs(), 'day') < 0) {
      log('date found at first argument', undefined, parsed[1])
      if (parsed[2]?.match(identifierRegExp) != null) {
        log('identifier found at second argument', undefined, parsed[2])
        return await context.reply(
          await getTungshingByIdentifier(new Identifier(parsed[2]), timezone, dayjs(parsed[1]).toDate()),
          {
            parse_mode: 'HTML',
            reply_to_message_id: context.message.message_id,
            ...Markup.inlineKeyboard([
              Markup.button.switchToCurrentChat('给我也整一个！', '')
            ])
          }
        )
      } else {
        return await context.reply(
          await getTungshingByUser(context.message.reply_to_message?.from ?? context.message.from, timezone, dayjs(parsed[1]).toDate()),
          {
            parse_mode: 'HTML',
            reply_to_message_id: context.message.message_id,
            ...Markup.inlineKeyboard([
              Markup.button.switchToCurrentChat('给我也整一个！', '')
            ])
          }
        )
      }
    } else {
      return await context.reply(
        await getTungshingByUser(context.message.reply_to_message?.from ?? context.message.from, timezone),
        {
          parse_mode: 'HTML',
          reply_to_message_id: context.message.message_id,
          ...Markup.inlineKeyboard([
            Markup.button.switchToCurrentChat('给我也整一个！', '')
          ])
        }
      )
    }
  })

  // 今日黄历
  bot.inlineQuery(/^$/, async (context) => {
    log('Empty inline query', undefined, context.inlineQuery)
    const date = new Date()

    return await context.answerInlineQuery(
      [await getTungshingArticleByUser(context.inlineQuery.from, timezone, date)],
      {
        cache_time: 30,
        is_personal: true
      }
    )
  })
  bot.inlineQuery(identifierRegExp, async (context) => {
    log('Found identifier in inline query', undefined, context.inlineQuery)
    const date = new Date()

    return await context.answerInlineQuery(
      [
        await getTungshingArticleByIdentifier(
          new Identifier(context.inlineQuery.query),
          timezone,
          date
        ),
        context.inlineQuery.query.match(baguaRegExp) != null ? {
          type: 'article',
          id: (await hash(context.inlineQuery.query)).slice(0, 7),
          title: '⚙ 将黄历码转换为 UUID',
          description: '查询黄历码对应的 UUID',
          input_message_content: {
            message_text: `
<strong>黄历码</strong> <pre>${new Identifier(context.inlineQuery.query).toString('bagua') as string}</pre>
<strong>UUID</strong> <pre>${new Identifier(context.inlineQuery.query).toString('uuid') as string}</pre>
            `,
            parse_mode: 'HTML'
          },
          thumb_url: 'https://user-images.githubusercontent.com/21154023/131263446-98ac53a2-8219-479a-8ddd-1b4754ff28cc.png'
        } : {
          type: 'article',
          id: (await hash(context.inlineQuery.query)).slice(0, 7),
          title: '⚙ 将 UUID 转换为黄历码',
          description: '查询 UUID 对应的黄历码',
          input_message_content: {
            message_text: `
<strong>UUID</strong> <pre>${new Identifier(context.inlineQuery.query).toString('uuid') as string}</pre>
<strong>黄历码</strong> <pre>${new Identifier(context.inlineQuery.query).toString('bagua') as string}</pre>
                      `,
            parse_mode: 'HTML'
          },
          thumb_url: 'https://user-images.githubusercontent.com/21154023/131263446-98ac53a2-8219-479a-8ddd-1b4754ff28cc.png'
        }
      ],
      {
        cache_time: 30,
        is_personal: false
      }
    )
  })

  // 历史黄历
  bot.inlineQuery(dateRegExp, async (context) => {
    log('Found date in inline query', undefined, context.inlineQuery)
    const day = dayjs.tz(context.inlineQuery.query, timezone)
    if (!day.isValid()) {
      log('Date is invalid', undefined, context.inlineQuery)
      const date = new Date()

      return await context.answerInlineQuery(
        [
          {
            type: 'article',
            id: (await hash(context.inlineQuery.query)).slice(0, 7),
            title: '⚠ 日期格式错误',
            description: '已自动回落今日音游黄历',
            input_message_content: {
              message_text: `
<strong>⚠ 日期格式错了哦~</strong>

正解格式 <pre>${
  date.toLocaleString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' })
    .split('/')
    .map(x => x.padStart(2, '0'))
    .join('')
  }</pre> (YYYYMMDD)
              `,
              parse_mode: 'HTML'
            },
            thumb_url: 'https://user-images.githubusercontent.com/21154023/131263236-1d09f0c5-a2b0-44bf-ab38-321e06830761.png'
          },
          await getTungshingArticleByUser(context.inlineQuery.from, timezone, date)
        ],
        {
          cache_time: 30,
          is_personal: true
        }
      )
    }
    if (day.diff(dayjs(), 'day') > 0) {
      const date = new Date()
      log('Date is too late', undefined, context.inlineQuery)
      return await context.answerInlineQuery(
        [
          {
            type: 'article',
            id: (await hash(context.inlineQuery.query)).slice(0, 7),
            title: '⚠ 日期过于超前',
            description: '已自动回落今日音游黄历',
            input_message_content: {
              message_text: `
<strong>⚠ 日期太超前了哦~</strong>

正解格式 <pre>${
  date.toLocaleString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' })
    .split('/')
    .map(x => x.padStart(2, '0'))
    .join('')
  }</pre> (YYYYMMDD)
黄历姬还没有练成预测未来的能力，无法计算音游黄历！
              `,
              parse_mode: 'HTML'
            },
            thumb_url: 'https://user-images.githubusercontent.com/21154023/131263236-1d09f0c5-a2b0-44bf-ab38-321e06830761.png'
          },
          await getTungshingArticleByUser(context.inlineQuery.from, timezone, date)
        ],
        {
          cache_time: 30,
          is_personal: true
        }
      )
    }
    const date = day.toDate()

    return await context.answerInlineQuery(
      [await getTungshingArticleByUser(context.inlineQuery.from, timezone, date)],
      {
        cache_time: 30,
        is_personal: true
      }
    )
  })
  bot.inlineQuery(/^(\d{4})(\d{2})(\d{2}) [乾兑地坎坤天山巽水泽火离艮雷震风a-f0-9]{8}[·-][乾兑地坎坤天山巽水泽火离艮雷震风a-f0-9]{4}[·-][乾兑地坎坤天山巽水泽火离艮雷震风a-f0-9]{4}[·-][乾兑地坎坤天山巽水泽火离艮雷震风a-f0-9]{4}[·-][乾兑地坎坤天山巽水泽火离艮雷震风a-f0-9]{12}$/, async (context) => {
    const day = dayjs.tz(context.inlineQuery.query.split(' ')[0], timezone)
    if (!day.isValid()) {
      const date = new Date()

      log('Date is invalid', undefined, context.inlineQuery)

      return await context.answerInlineQuery(
        [
          {
            type: 'article',
            id: (await hash(context.inlineQuery.query)).slice(0, 7),
            title: '⚠ 日期格式错误',
            description: '已自动回落今日音游黄历',
            input_message_content: {
              message_text: `
<strong>⚠ 日期格式错了哦~</strong>

正解格式 <pre>${
  date.toLocaleString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' })
    .split('/')
    .map(x => x.padStart(2, '0'))
    .join('')
  }</pre> (YYYYMMDD)
              `,
              parse_mode: 'HTML'
            },
            thumb_url: 'https://user-images.githubusercontent.com/21154023/131263236-1d09f0c5-a2b0-44bf-ab38-321e06830761.png'
          },
          await getTungshingArticleByUser(context.inlineQuery.from, timezone, date)
        ],
        {
          cache_time: 30,
          is_personal: true
        }
      )
    }
    if (day.diff(dayjs(), 'day') > 0) {
      const date = new Date()
      log('Date is too late', undefined, context.inlineQuery)
      return await context.answerInlineQuery(
        [
          {
            type: 'article',
            id: (await hash(context.inlineQuery.query)).slice(0, 7),
            title: '⚠ 日期过于超前',
            description: '已自动回落今日音游黄历',
            input_message_content: {
              message_text: `
<strong>⚠ 日期太超前了哦~</strong>

正解格式 <pre>${
  date.toLocaleString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' })
    .split('/')
    .map(x => x.padStart(2, '0'))
    .join('')
  }</pre> (YYYYMMDD)
黄历姬还没有练成预测未来的能力，无法计算音游黄历！
              `,
              parse_mode: 'HTML'
            },
            thumb_url: 'https://user-images.githubusercontent.com/21154023/131263236-1d09f0c5-a2b0-44bf-ab38-321e06830761.png'
          },
          await getTungshingArticleByUser(context.inlineQuery.from, timezone, date)
        ],
        {
          cache_time: 30,
          is_personal: true
        }
      )
    }
    const date = day.toDate()

    return await context.answerInlineQuery(
      [await getTungshingArticleByIdentifier(
        new Identifier(context.inlineQuery.query.split(' ')[1]),
        timezone,
        date
      )],
      {
        cache_time: 30,
        is_personal: false
      }
    )
  })

  return [{
    command: 'tungshing',
    description: '[日期] [黄历码] - 生成音游黄历！'
  }]
}

async function getTungshingArticleByUser (user: User, timezone = 'Asia/Shanghai', date = new Date()): Promise<InlineQueryResult> {
  const tungshingResult = await getTungshingByUser(
    user,
    timezone,
    date
  )
  return {
    type: 'article',
    id: (await hash(tungshingResult)).slice(0, 7),
    title: `📅 ${getNickname(user)} 的${isToday(date, timezone) ? '今日' : '历史'}黄历`,
    description: `查询 ${pangu.spacing(date.toLocaleDateString('zh-CN', { dateStyle: 'full', timeZone: timezone }))}的音游黄历`,
    input_message_content: {
      message_text: tungshingResult,
      parse_mode: 'HTML'
    },
    thumb_url: 'https://avatars.githubusercontent.com/u/88090726',
    ...Markup.inlineKeyboard([
      Markup.button.switchToCurrentChat('给我也整一个！', '')
    ])
  }
}

async function getTungshingArticleByIdentifier (identifier: Identifier, timezone = 'Asia/Shanghai', date = new Date()): Promise<InlineQueryResult> {
  const tungshingResult = await getTungshingByIdentifier(
    identifier,
    timezone,
    date
  )
  return {
    type: 'article',
    id: (await hash(tungshingResult)).slice(0, 7),
    title: `📅 从黄历码生成${isToday(date, timezone) ? '今日' : '历史'}音游黄历`,
    description: `查询 ${pangu.spacing(date.toLocaleDateString('zh-CN', { dateStyle: 'full', timeZone: timezone }))}的音游黄历`,
    input_message_content: {
      message_text: tungshingResult,
      parse_mode: 'HTML'
    },
    thumb_url: 'https://avatars.githubusercontent.com/u/88090726',
    ...Markup.inlineKeyboard([
      Markup.button.switchToCurrentChat('给我也整一个！', '')
    ])
  }
}

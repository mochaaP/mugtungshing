import { Router } from 'tiny-request-router'
import { prefixPath, getStubServerResponse, ResponseOptions, Logger } from '../../../../utils'
import { Callback, EventContext, ExtraEvent, Middleware } from '../../..'

import { Telegraf, Context } from 'telegraf'

import handle from './handler'

async function createBot (token: string, options?: Partial<Telegraf.Options<Context>>): Promise<Telegraf> {
  const bot = new Telegraf(token, options)
  bot.botInfo = await bot.telegram.getMe()
  return bot
}

export default function (prefix: string): Middleware {
  const path = prefixPath(prefix)

  return function apply (router: Router, event: ExtraEvent): Callback {
    const { log } = event.extra.logger as Logger
    router
      .post(path(`/webhook/${BOT_PATH}`), async (context: EventContext) => { // handle webhook events
        log('Creating bot')
        const bot = await createBot(BOT_TOKEN)

        log('Registering middleware and commands')
        await handle(bot, event)

        const response = new ResponseOptions()

        log('Responding to Telegram')
        context.event.waitUntil(bot.handleUpdate(await context.event.request.json(), getStubServerResponse(response)))

        return new Response(response[0], response[1])
      })
      .get(path('/set-webhook'), async (context: EventContext) => { // set webhook url
        log('Creating bot')
        const bot = await createBot(BOT_TOKEN)

        log('Registering middleware and commands')
        await handle(bot, event) // set commands while setting webhook

        const url = new URL(context.event.request.url)

        url.pathname = path(`/webhook/${BOT_PATH}`)

        try {
          log('Setting webhook URL', undefined, url.toString())
          await bot.telegram.setWebhook(url.toString())
          log('Bot launched successfully')
          return new Response(
            JSON.stringify({
              message: 'Bot launched'
            })
          )
        } catch (e) {
          log('Setting webhook URL failed', 'critical', e)
          return new Response(
            JSON.stringify(
              {
                message: e.message
              }
            ),
            {
              status: 500
            })
        }
      })

    return () => {} // placeholder callback
  }
}

import { Router } from 'tiny-request-router'
import { prefixPath, getStubServerResponse, ResponseOptions } from '../../../../utils'
import { Callback, EventContext, Middleware } from '../../..'

import { Telegraf, Context } from 'telegraf'

import handle from './handler'

async function createBot (token: string, options?: Partial<Telegraf.Options<Context>>): Promise<Telegraf> {
  const bot = new Telegraf(token, options)
  bot.botInfo = await bot.telegram.getMe()
  return bot
}

export default function (prefix: string): Middleware {
  const path = prefixPath(prefix)

  return function apply (router: Router): Callback {
    router
      .post(path(`/webhook/${BOT_PATH}`), async (context: EventContext) => { // handle webhook events
        const bot = await createBot(BOT_TOKEN)

        await handle(bot)

        const response = new ResponseOptions()

        context.event.waitUntil(bot.handleUpdate(await context.event.request.json(), getStubServerResponse(response)))

        return new Response(response[0], response[1])
      })
      .get(path('/set-webhook'), async (context: EventContext) => { // set webhook url
        const bot = await createBot(BOT_TOKEN)

        await handle(bot) // set commands while setting webhook

        const url = new URL(context.event.request.url)

        url.pathname = path(`/webhook/${BOT_PATH}`)

        try {
          await bot.telegram.setWebhook(url.toString())
          return new Response(
            JSON.stringify({
              message: 'Bot launched'
            })
          )
        } catch (e) {
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

import { Router } from 'tiny-request-router'
import { prefixPath } from '../../utils'
import { EventContext, Route } from '..'

import { Telegraf, Context } from 'telegraf'
import { ServerResponse } from 'http'

async function createBot (token: string, options?: Partial<Telegraf.Options<Context>>): Promise<Telegraf> {
  const bot = new Telegraf(token, options)
  bot.botInfo = await bot.telegram.getMe()
  return bot
}

export default function (prefix: string): Route {
  const path = prefixPath(prefix)

  return function (router: Router): void {
    router
      .post(path(`/webhook/${BOT_PATH}`), async (context: EventContext) => { // handle webhook events
        const bot = await createBot(BOT_TOKEN)

        function responseBuilder (response: any): ServerResponse {
          return new Proxy(
            Object.assign(response, {
              set: (...args: any) => response.headers.set(...args),
              header: response.headers
            }),
            {
              set (object, propertyKey, value) {
                if ( // body is an object
                  propertyKey === 'body' &&
                  ['Object', 'Array'].includes(Object.getPrototypeOf(value).constructor.name)
                ) { // stringify that
                  object.body = JSON.stringify(value)
                  object.headers.set('content-type', 'application/json')
                  return true // and breaks
                } // else pass through
                return Reflect.set(object, propertyKey, value)
              }
            }
          )
        }

        const response = { body: '', headers: {} }

        await bot.handleUpdate(await context.event.request.json(), responseBuilder(response))

        return new Response(response.body, { headers: response.headers })
      })
      .get(path('/set-webhook'), async (context: EventContext) => { // set webhook url
        const bot = await createBot(BOT_TOKEN)

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
  }
}

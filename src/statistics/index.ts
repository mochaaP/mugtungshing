import { Middleware } from 'telegraf'
import { TelegrafContext } from 'telegraf/typings/context'
import { sentry } from './sentry'
import { relic } from './newrelic'

export { sentryLogging, sentry } from './sentry'
export { newRelicLogging, relic } from './newrelic'
export const telegrafStatistic: Middleware<TelegrafContext> = async (ctx, next) => {
  sentry.setExtra('ctx', ctx)
  relic.add('processing telegraf event', { ctx })
  if (ctx.update?.message?.from.id != null) {
    sentry.setUser({
      ...ctx.update.message.from,
      ...{ id: ctx.update.message.from.id.toString() }
    })
    relic.add('processing telegraf event from user', { user: ctx.update.message.from })
  }

  const start = new Date().getTime()
  return await next().then(() => {
    const ms = new Date().getTime() - start
    relic.add('done processing telegraf event', { duration: ms })
  })
}

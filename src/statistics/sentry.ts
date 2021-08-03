import { Middleware } from '@cfworker/web'
import Toucan from 'toucan-js'

export let sentry: Toucan

export const sentryLogging: Middleware = async (context, next) => {
  const { req } = context
  sentry = new Toucan({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    rewriteFrames: {
      root: '/'
    },
    context,
    request: req.raw,
    allowedSearchParams: /(.*)/
  })
  try {
    await next()
  } catch (err) {
    sentry.captureException(err)
    throw err
  }
}

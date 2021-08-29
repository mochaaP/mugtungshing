import { Router } from 'tiny-request-router'
import Toucan from 'toucan-js'
import { Callback, ExtraEvent, Middleware } from '../../..'

export default function (): Middleware {
  return function apply (router: Router, event: ExtraEvent): Callback {
    const sentry = new Toucan({
      dsn: SENTRY_DSN,
      context: event, // Includes 'waitUntil', which is essential for Sentry logs to be delivered. Also includes 'request' -- no need to set it separately.
      allowedHeaders: ['user-agent'],
      allowedSearchParams: /(.*)/
    })
    event.extra.sentry = sentry

    return () => {}
  }
}

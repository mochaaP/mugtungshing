import { Router } from 'tiny-request-router'
import bot from './bot'
import sentry from './sentry'
import newrelic from './newrelic'
import { Callback, ExtraEvent } from '../..'
import { Logger } from '../../../utils'

export default [
  sentry([
    newrelic(),
    (router: Router, event: ExtraEvent): Callback => {
      Object.assign(event, { extra: { logger: new Logger(event) } })
      return () => {}
    },
    bot('/bot')
  ])
]

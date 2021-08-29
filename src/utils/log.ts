import Toucan from 'toucan-js'
import { Level } from 'toucan-js/dist/types'
import { ExtraEvent } from '../routes'
import { NewRelic } from '../routes/middleware/handler/newrelic'

export class Logger {
  readonly sentry: Toucan
  readonly newrelic: NewRelic

  constructor (event: ExtraEvent) {
    this.sentry = event.extra.sentry
    this.newrelic = event.extra.newrelic
    Object.assign(event, { extra: { logger: this } })
  }

  log (message: string, level: Level = 'debug', data?: any): void {
    this.sentry.addBreadcrumb({
      message: message,
      level: level,
      data: data
    })
    this.newrelic.add(
      message,
      { data, level }
    )
  }
}

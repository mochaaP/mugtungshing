import Toucan from 'toucan-js'
import { Level } from 'toucan-js/dist/types'
import { NewRelic } from '../routes/middleware/handler/newrelic'

export class Logger {
  readonly sentry: Toucan
  readonly newrelic: NewRelic

  constructor (sentry: Toucan, newrelic: NewRelic) {
    this.sentry = sentry
    this.newrelic = newrelic
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

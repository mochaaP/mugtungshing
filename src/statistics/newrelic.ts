import { Context, Middleware } from '@cfworker/web'
import { jsonFetch as fetch } from '@worker-tools/json-fetch'
export class NewRelic {
  readonly common: {
    timestamp?: number
    attributes?: {[key: string]: any}
  }

  readonly logs: [{
    timestamp?: number
    message?: string
    attributes?: {[key: string]: any}
  }?] = []

  private readonly waitUntil: (promise: Promise<any>) => void
  private readonly license: string
  readonly endpoint: URL

  constructor (
    license: string,
    context: Context,
    attributes?: {[key: string]: any},
    endpoint = new URL('https://log-api.newrelic.com/'),
    timestamp = Math.floor(Date.now() / 1000)
  ) {
    this.common = { timestamp, attributes }
    this.license = license
    this.endpoint = endpoint
    this.waitUntil = context.waitUntil
  }

  add (message?: string, attributes?: {[key: string]: any}, timestamp = Math.floor(Date.now() / 1000)): void {
    this.logs.push({
      message,
      timestamp,
      attributes
    })
  }

  capture (): void {
    return this.waitUntil(fetch(new URL('log/v1', this.endpoint), {
      method: 'POST',
      body: [{
        common: this.common,
        logs: this.logs
      }],
      headers: {
        'X-License-Key': this.license
      }
    }))
  }
}

export let relic: NewRelic

export const newRelicLogging: Middleware = async (context, next) => {
  relic = new NewRelic(
    NEWRELIC_LICENSE_KEY,
    context,
    { service: 'telegram-bot', environment: ENVIRONMENT },
    new URL('https://log-api.eu.newrelic.com/')
  )
  relic.add('start processing request', { context })
  return await next().then(() => {
    relic.add('done processing request')
    relic.capture()
  })
}

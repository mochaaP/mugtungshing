import { Router } from 'tiny-request-router'
import { Callback, ExtraEvent, Middleware } from '../../..'
import { jsonFetch as fetch } from '@worker-tools/json-fetch'
import { nanoid } from 'nanoid'

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
    event: ExtraEvent,
    attributes?: {[key: string]: any},
    endpoint = new URL('https://log-api.newrelic.com/'),
    timestamp = Date.now()
  ) {
    this.common = { timestamp, attributes }
    this.license = license
    this.endpoint = endpoint
    this.waitUntil = (promise) => event.waitUntil(promise)
  }

  add (message?: string, attributes?: {[key: string]: any}, timestamp = Math.floor(Date.now() / 1000)): void {
    this.logs.push({
      message,
      timestamp,
      attributes
    })
  }

  capture (): void {
    return this.waitUntil(fetch(new URL('log/v1', this.endpoint).toString(), {
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

export default (): Middleware => {
  return function apply (router: Router, event: ExtraEvent): Callback {
    const newrelic = new NewRelic(
      NEWRELIC_LICENSE_KEY,
      event,
      {
        service: 'telegram-bot',
        environment: ENVIRONMENT,
        hostname: new URL(event.request.url).hostname,
        eventId: nanoid()
      },
      new URL('https://log-api.eu.newrelic.com/')
    )
    event.extra.newrelic = newrelic

    newrelic.add('Start processing request', { request: event.request })

    return newrelic.capture
  }
}

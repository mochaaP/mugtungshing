import { Context, Middleware } from '@cfworker/web'
import ky from 'ky-universal'
import type { ky as KyInterface } from 'ky/distribution/types/ky'

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

  private readonly rq: KyInterface

  waitUntil: (promise: Promise<any>) => void

  constructor (
    license: string,
    context: Context,
    attributes?: {[key: string]: any},
    endpoint = new URL('https://log-api.newrelic.com/'),
    timestamp = Math.floor(Date.now() / 1000)
  ) {
    this.common = { timestamp, attributes }
    this.waitUntil = context.waitUntil
    this.rq = ky.create({
      headers: {
        'X-License-Key': license
      },
      prefixUrl: endpoint
    })
  }

  add (message?: string, attributes?: {[key: string]: any}, timestamp = Math.floor(Date.now() / 1000)): void {
    this.logs.push({
      message,
      timestamp,
      attributes
    })
  }

  capture (): void {
    return this.waitUntil(this.rq.post('log/v1', {
      json: [{
        common: this.common,
        logs: this.logs
      }]
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

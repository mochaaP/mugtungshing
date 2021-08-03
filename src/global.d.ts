import CloudflareWorkerGlobalScope from 'types-cloudflare-worker'
declare var self: CloudflareWorkerGlobalScope // eslint-disable-line @typescript-eslint/no-unused-vars

declare global {
  const BOT_PATH: string
  const BOT_TOKEN: string
  const SENTRY_DSN: string
  const NEWRELIC_LICENSE_KEY: string
  const ENVIRONMENT: 'production' | 'staging' |'development'
}

export {}

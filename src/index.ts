import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'
import './routes'

declare global {
  const BOT_PATH: string
  const BOT_TOKEN: string
  const SENTRY_DSN: string
  const NEWRELIC_LICENSE_KEY: string
  const ENVIRONMENT: 'production' | 'staging' | 'development'
}

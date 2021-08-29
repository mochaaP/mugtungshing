import bot from './bot'
import sentry from './sentry'
import newrelic from './newrelic'

export default [
  sentry(), // handle errors at top level
  newrelic(), // then start logging
  bot('/bot')
]

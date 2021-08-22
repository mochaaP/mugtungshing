import { Router, Method, RouteMatch } from 'tiny-request-router'

import bot from './bot'

export type Handler = (params: EventContext) => Promise<Response>
export type Route = (router: Router) => void

export interface EventContext {
  event: FetchEvent
  match: RouteMatch<Handler>
}

const routes = [
  bot('/bot')
]

const router = new Router<Handler>()

routes.forEach(route => {
  route(router)
})

addEventListener('fetch', event => {
  const request = event.request
  const { pathname } = new URL(request.url)

  const match = router.match(request.method as Method, pathname)
  if (match != null) {
    event.respondWith(match.handler({ event, match }))
  }
})

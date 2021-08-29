import { Router, Method, RouteMatch } from 'tiny-request-router'

import apply from './middleware'

export type Handler = (params: EventContext) => Promise<Response>
export type Middleware = (router: Router, event: ExtraEvent) => Callback
export type ExtraEvent = FetchEvent & { extra: any }
export type Callback = (response: Response) => void

export interface EventContext {
  event: ExtraEvent
  match: RouteMatch<Handler>
}

addEventListener('fetch', (event) => {
  const router = new Router<Handler>()

  const event_ = Object.assign(event, { extra: {} })

  const callbacks = apply(router, event_)

  const request = event.request
  const { pathname } = new URL(request.url)

  const match = router.match(request.method as Method, pathname)

  if (match != null) {
    event.respondWith(
      match.handler({ event: event_, match })
        .then(response => {
          callbacks.forEach((callback: Callback) => callback(response)) // do Object.assign to modify response
          return response
        })
    )
  }
})

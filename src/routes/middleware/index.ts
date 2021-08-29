import { Router } from 'tiny-request-router'
import { ExtraEvent, Callback } from '..'
import handlers from './handler'

export default function apply (router: Router, event: ExtraEvent): Callback[] {
  return handlers.map(handler => handler(router, event))
}

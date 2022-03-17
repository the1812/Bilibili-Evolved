import { subject } from './subject'

export const of = (...items: any[]) => subject(({ next, complete }) => {
  items.forEach(item => { next(item) })
  complete()
})

export const fromEvent = (element: EventTarget, eventName: string) => subject<Event>(({ next }) => {
  element.addEventListener(eventName, next)
  return () => element.removeEventListener(eventName, next)
})

export const fromPromise = <T>(promise: Promise<T>) => subject<T>(({ next, complete, error }) => {
  promise
    .then(next)
    .catch(error)
    .finally(complete)
})

export const bindCallback = <T>(cb: (...args: any[]) => any, ...args_: any[]) => subject<T>(
  ({ next }) => {
    cb(...args_, next)
  },
)

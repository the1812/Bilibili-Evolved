import { PublishContext } from '../subject'

export const startWith =
  (...values: any[]) =>
  ({ next, subscribe }: PublishContext) => {
    let seen = false
    subscribe(value => {
      if (!seen) {
        values.forEach(v => next(v))
      }
      next(value)
      seen = true
    })
  }

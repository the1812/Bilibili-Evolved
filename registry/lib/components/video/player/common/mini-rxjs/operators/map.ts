import { PublishContext } from '../subject'

export const map =
  <T = unknown, R = T>(mapper: (value: T) => R) =>
  ({ subscribe, next }: PublishContext<T, R>) => {
    subscribe(value => {
      next(mapper(value))
    })
  }

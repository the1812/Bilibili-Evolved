import { PublishContext } from '../subject'

export const filter =
  <T>(predicate: (value: T) => boolean) =>
  ({ subscribe, next }: PublishContext<T>) => {
    subscribe(value => {
      predicate(value) && next(value)
    })
  }

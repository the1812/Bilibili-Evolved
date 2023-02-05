import type { Observer, PublishContext } from '../subject'
import { toStandardizedObserver } from '../subject'

export const tap =
  <T>(observer: Observer<T>) =>
  ({ subscribe, next, error, complete }: PublishContext<T>) => {
    const standardizedObserver = toStandardizedObserver(observer)

    subscribe(
      lodash.mapValues({ next, error, complete }, (v, k) => (value?: T | Error) => {
        standardizedObserver[k]?.(value)
        v.call(null, value)
      }),
    )
  }

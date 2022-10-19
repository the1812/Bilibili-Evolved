import { PublishContext } from '../subject'

export const pairwise =
  <T = unknown>() =>
  ({ subscribe, next }: Pick<PublishContext<T, T[]>, 'subscribe' | 'next'>) => {
    const buffer = []

    subscribe(value => {
      if (buffer.length === 2) {
        buffer.shift()
      }
      buffer.push(value)
      if (buffer.length === 2) {
        next(buffer.slice())
      }
    })

    return () => {
      buffer.length = 0
    }
  }

import { PublishContext } from '../subject'

export const bufferSet =
  <T>(predicate: (value: T) => boolean) =>
  ({ subscribe, next }: PublishContext) => {
    const set = new Set()
    subscribe(value => {
      const oldSize = set.size
      if (predicate(value)) {
        set.add(value)
      } else {
        set.delete(value)
      }
      set.size !== oldSize && next([...set])
    })
    return () => {
      set.clear()
    }
  }

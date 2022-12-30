import { PublishContext } from '../subject'

export const distinctUntilChanged =
  () =>
  ({ subscribe, next }: PublishContext) => {
    let firstVisited = true
    let previous

    subscribe(value => {
      if (firstVisited || previous !== value) {
        firstVisited = false
        previous = value
        next(value)
      }
    })
  }

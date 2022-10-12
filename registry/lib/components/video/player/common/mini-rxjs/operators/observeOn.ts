import { PublishContext } from '../subject'

export const observeOn =
  scheduler =>
  ({ subscribe, next, complete, error }: PublishContext) => {
    subscribe(
      lodash.mapValues(
        {
          next,
          complete,
          error,
        },
        action => scheduler(action),
      ),
    )
  }

export const asapScheduler =
  action =>
  (...args) => {
    Promise.resolve().then(() => action(...args))
  }

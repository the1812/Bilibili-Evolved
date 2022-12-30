import { PublishContext } from '../subject'

export const debounceTime =
  (wait: number) =>
  ({ subscribe, next, error }: PublishContext) => {
    subscribe(
      lodash.debounce(value => {
        try {
          next(value)
        } catch (err) {
          error(err)
        }
      }, wait),
    )
  }

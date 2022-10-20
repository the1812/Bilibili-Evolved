import { subject, Subject } from '../subject'
import { asapScheduler, observeOn } from './observeOn'
import { withTeardownLogic } from './util'

export const combineLatest = (...input: Subject<unknown>[]) =>
  subject(({ next, error, complete }) =>
    withTeardownLogic(teardown => {
      const buffer = []
      let completedCount = 0

      teardown(
        input.map((s, i) =>
          s.pipe(observeOn(asapScheduler)).subscribe({
            next: value => {
              buffer[i] = value
              if (buffer.reduce(a => a + 1, 0) === input.length) {
                next(buffer.slice())
              }
            },
            complete: () => {
              completedCount++
              if (completedCount === input.length) {
                complete()
              }
            },
            error,
          }),
        ),
      )

      teardown(() => {
        buffer.length = 0
        completedCount = 0
      })
    }),
  )

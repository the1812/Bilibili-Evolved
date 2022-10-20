import { getGeneralSettings } from '@/core/settings'

export type EmptyFunction = () => void
export type TeardownLogic = EmptyFunction
export type Unsubscribe = EmptyFunction

export interface StandardizedObserver<T = any> {
  next(value?: T): void
  error?(err: Error): void
  complete?(): void
}

export type Observer<T = any> = ((value: T) => void) | StandardizedObserver<T>

export interface PublishContext<T = any, R = T>
  extends Required<Omit<StandardizedObserver<R>, 'completed'>> {
  subscribe?(observer?: Observer<T>): Unsubscribe | undefined
}

export interface Publisher<T = any, R = T> {
  (context: PublishContext<T, R>): TeardownLogic | void
}

export interface Operator<T = any, R = T> {
  (context: PublishContext<T, R>): TeardownLogic | void
}

export interface Subject<T> extends Required<PublishContext<T>> {
  connect(): void
  pipe<R = T>(...operators: Operator[]): Subject<R>
}

export const toStandardizedObserver = <T>(observer: Observer<T>): StandardizedObserver<T> =>
  typeof observer === 'function' ? { next: observer } : observer

export const subject = <T, R = T>(publisher?: Publisher<T, R>): Subject<R> =>
  (function internalSubject(publisher_, parent = undefined, root = undefined) {
    let connected = false

    const teardownLogicList: TeardownLogic[] = []
    const observers = []
    let completed = false

    const cleanup = () => {
      while (teardownLogicList.length) {
        teardownLogicList.pop()()
      }
      observers.length = 0
      completed = true
    }

    const error = (err: Error) => {
      if (completed) {
        return
      }
      observers.forEach(observer => {
        observer.error?.(err)
        getGeneralSettings().devMode && console.error(err)
      })
      cleanup()
    }

    const next = (value: R) => {
      if (completed) {
        return
      }
      observers.forEach(observer => {
        try {
          observer.next(value)
        } catch (err) {
          error(err)
        }
      })
    }

    const complete = () => {
      observers.forEach(observer => {
        observer.complete?.()
      })
      cleanup()
    }

    const connect = () => {
      if (connected) {
        return
      }
      const teardownLogic = publisher_?.({ next, error, complete })
      teardownLogic && teardownLogicList.push(teardownLogic)
      connected = true
    }

    const subscribe = (observer?: StandardizedObserver<T>) => {
      if (observer == null) {
        return null
      }
      observers.push(observer)
      return () => {
        lodash.pull(observers, observer)
      }
    }

    const pipe = (...publishers: Publisher<any>[]) => {
      if (publishers.length === 0) {
        return {
          subscribe: observer => {
            const unsubscribe = subscribe(toStandardizedObserver(observer))
            ;(root?.connect ?? connect)()
            return unsubscribe
          },
          pipe,
          next,
          error,
          complete,
          ...root,
        }
      }
      return internalSubject(
        publishers[0],
        { subscribe },
        root || {
          connect,
          next,
        },
      ).pipe(...publishers.slice(1))
    }

    if (parent) {
      const teardownLogic = publisher_?.({
        subscribe: observer =>
          parent.subscribe(
            // 默认传递本级的 error 和 complete，这样实现操作符时，将简单许多，一般情况下，错误和完成信号都能沿着链式调用传递下去
            { error, complete, ...toStandardizedObserver(observer) },
          ),
        next,
        error,
        complete,
      })
      teardownLogic && teardownLogicList.push(teardownLogic)
    }

    return pipe()
  })(publisher)

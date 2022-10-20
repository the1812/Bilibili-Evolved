import { Subject } from '../subject'

export const firstValueFrom = <T>(subject: Subject<T>) =>
  new Promise<T>((resolve, reject) => {
    const unsubscribe = subject.subscribe({
      next: (value: T) => {
        resolve(value)
        unsubscribe()
      },
      error: () => {
        reject()
        unsubscribe()
      },
      complete: () => {
        reject()
        unsubscribe()
      },
    })
  })

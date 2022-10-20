import { Subject as SubjectReturnType } from './subject'

export const firstValueFrom = <T>(subject: SubjectReturnType<T>) =>
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

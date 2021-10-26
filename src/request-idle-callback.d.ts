type RequestIdleCallbackHandle = number
type RequestIdleCallbackOptions = {
  timeout: number
}
type RequestIdleCallbackDeadline = {
  readonly didTimeout: boolean
  timeRemaining: (() => number)
}
declare global {
  const requestIdleCallback: (
    callback: (deadline: RequestIdleCallbackDeadline) => void,
    options?: RequestIdleCallbackOptions,
  ) => RequestIdleCallbackHandle
  const cancelIdleCallback: (handle: RequestIdleCallbackHandle) => void
}
export { }

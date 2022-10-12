export const promiseLoadTime = new Map<{ name: string }, number>()
export const promiseResolveTime = new Map<{ name: string }, number>()
export const promiseLoadTrace = async <T>(name: string, promiseFunc: () => Promise<T>) => {
  const { getGeneralSettings } = await import('../settings')
  if (!getGeneralSettings().devMode) {
    return promiseFunc()
  }
  const start = performance.now()
  const promise = promiseFunc()
  const end = performance.now()
  const result = await promise
  const resolve = performance.now()
  promiseLoadTime.set({ name }, end - start)
  promiseResolveTime.set({ name }, resolve - start)
  return result
}

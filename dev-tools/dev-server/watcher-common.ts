import { Stats } from 'webpack'

export const defaultWatcherHandler = (
  initCallback: (result: Stats) => void,
  updateCallback: (result: Stats) => void,
) => {
  let lastHash = ''
  return (error: Error, result: Stats) => {
    if (error) {
      console.error(error)
      return
    }
    if (result.hash === lastHash) {
      return
    }
    if (!lastHash) {
      initCallback(result)
    }
    lastHash = result.hash
    updateCallback(result)
  }
}

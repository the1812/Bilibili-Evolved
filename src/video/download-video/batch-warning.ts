export const MaxBatchSize = 32
export const BannedResponse = 412
export const showBatchWarning = (title: string) => {
  Toast.info(`为防止短时间内大量下载导致封禁, 请不要选择超过${MaxBatchSize}的集数.`, title, 5000)
}
export const throwBatchError = () => {
  throw new Error(`为防止短时间内大量下载导致封禁, 请不要选择超过${MaxBatchSize}的集数.`)
}
export const throwBannedError = () => {
  throw new Error(`短时间内下载量过大, 请过段时间再试.`)
}
export default {
  export: {
    MaxBatchSize,
    BannedResponse,
    showBatchWarning,
    throwBatchError,
    throwBannedError,
  }
}

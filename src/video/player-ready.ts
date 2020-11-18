/** 等待播放器准备好, 如果过早注入 DOM 元素可能会导致爆炸
 *
 * https://github.com/the1812/Bilibili-Evolved/issues/1076
 * https://github.com/the1812/Bilibili-Evolved/issues/770
 */
export const playerReady = () => {
  return new Promise(async (resolve, reject) => {
    await SpinQuery.condition(
      () => unsafeWindow,
      () => unsafeWindow.onLoginInfoLoaded !== undefined,
    )
    if (unsafeWindow.onLoginInfoLoaded) {
      unsafeWindow.onLoginInfoLoaded(resolve)
    } else {
      logError(new Error('utils.playerReady 失败'))
      console.error(`typeof onLoginInfoLoaded === ${typeof unsafeWindow.onLoginInfoLoaded}`)
      reject()
    }
  })
}
export default {
  export: { playerReady },
}

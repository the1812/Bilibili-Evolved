/** 等待播放器准备好, 如果过早注入 DOM 元素可能会导致爆炸
 *
 * https://github.com/the1812/Bilibili-Evolved/issues/1076
 * https://github.com/the1812/Bilibili-Evolved/issues/770
 */
export const playerReady = () => {
  return new Promise<void>(async (resolve, reject) => {
    const isJudgementVideo = document.URL.replace(window.location.search, '') === 'https://www.bilibili.com/blackboard/newplayer.html' && document.URL.includes('fjw=true')
    if (isJudgementVideo) {
      /* 如果是风纪委员里的内嵌视频, 永远不 resolve
        https://github.com/the1812/Bilibili-Evolved/issues/2340
      */
      return
    }
    await SpinQuery.condition(
      () => unsafeWindow,
      () => unsafeWindow.UserStatus !== undefined,
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
export const aidReady = async () => {
  if (unsafeWindow.aid) {
    return unsafeWindow.aid
  }
  const info = await SpinQuery.condition(
    () => unsafeWindow?.player?.getVideoMessage?.() as { aid?: string },
    it => it?.aid !== undefined,
  ).catch(() => { throw new Error('Cannot find aid') })
  unsafeWindow.aid = info.aid
  return info.aid as string
}
export default {
  export: {
    playerReady,
    aidReady,
  },
}

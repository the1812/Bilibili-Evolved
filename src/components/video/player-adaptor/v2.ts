import { allMutations } from '@/core/observer'
import { select } from '@/core/spin-query'

const idPolyfill = async () => {
  const player = await select(() => unsafeWindow.player)
  if (!player?.getVideoMessage) {
    return
  }
  const { useScopedConsole } = await import('@/core/utils/log')
  const console = useScopedConsole('v2 player polyfill')
  allMutations(() => {
    const input = player.getVideoMessage()
    if (!input) {
      console.warn('invalid getUserParams data')
      return
    }
    const idData = {
      aid: input.aid.toString(),
      cid: input.cid.toString(),
      bvid: input.bvid,
    }
    if (Object.values(idData).some(it => it === '' || parseInt(it) <= 0)) {
      console.warn('invalid input data')
    }
    Object.assign(unsafeWindow, idData)
  })
}

export const v2PlayerPolyfill = lodash.once(() => {
  if (document.URL.startsWith('https://www.bilibili.com/bangumi/play/')) {
    return
  }
  if (unsafeWindow.aid || unsafeWindow.cid) {
    return
  }
  idPolyfill()
})

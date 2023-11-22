/* eslint-disable no-underscore-dangle */
import { allMutations } from '@/core/observer'
import { select } from '@/core/spin-query'
import { matchUrlPattern } from '@/core/utils'
import { bangumiUrls } from '@/core/utils/urls'

const idPolyfill = async () => {
  const player = await select(() => unsafeWindow.player)
  if (!player?.getManifest) {
    return
  }
  const { useScopedConsole } = await import('@/core/utils/log')
  const console = useScopedConsole('v4 player polyfill')
  allMutations(() => {
    const manifest = player.getManifest()
    if (!manifest) {
      console.warn('invalid getManifest data')
      return
    }
    const idData = {
      aid: manifest.aid.toString(),
      cid: manifest.cid.toString(),
      bvid: manifest.bvid ?? '',
    }
    if (Object.values(idData).some(it => it === '' || parseInt(it) <= 0)) {
      console.warn('invalid manifest data', idData)
    }
    Object.assign(unsafeWindow, idData)
  })
}

export const v4PlayerPolyfill = lodash.once(() => {
  if (bangumiUrls.some(url => matchUrlPattern(url))) {
    return
  }
  if (unsafeWindow.aid || unsafeWindow.cid) {
    return
  }
  idPolyfill()
})

import { allMutations } from '@/core/observer'
import { select } from '@/core/spin-query'
import { matchUrlPattern } from '@/core/utils'
import { bangumiUrls } from '@/core/utils/urls'

const isIdValid = (id: string) => {
  if (id === '') {
    return false
  }
  const idNumber = parseInt(id)
  if (Number.isNaN(idNumber)) {
    return true
  }
  return idNumber > 0
}
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
    const isIdDataValid = (() => {
      const isBangumi = bangumiUrls.some(url => matchUrlPattern(url))
      if (isBangumi) {
        return isIdValid(idData.aid) && isIdValid(idData.cid)
      }
      return Object.values(idData).every(it => isIdValid(it))
    })()
    if (!isIdDataValid) {
      console.warn('invalid manifest data', idData)
    }
    Object.assign(unsafeWindow, idData)
  })
}

export const v4PlayerPolyfill = lodash.once(() => {
  if (unsafeWindow.aid || unsafeWindow.cid) {
    return
  }
  idPolyfill()
})

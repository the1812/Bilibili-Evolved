import { attributes } from '@/core/observer'
import { select } from '@/core/spin-query'
import { preventEvent } from '@/core/utils'

const playerModePolyfill = async () => {
  const bpxContainer = await select('.bpx-player-container') as HTMLElement
  if (!bpxContainer) {
    console.warn('[bpx player polyfill] bpxContainer not found')
    return
  }
  attributes(bpxContainer, () => {
    const dataScreen = bpxContainer.getAttribute('data-screen')
    document.body.classList.toggle('player-mode-webfullscreen', dataScreen === 'full' || dataScreen === 'web')
    dataScreen === 'wide' ? document.body.classList.add('player-mode-widescreen') : ''
  })
}
const idPolyfill = async () => {
  const pbp = await select(() => unsafeWindow.$pbp)
  if (!pbp) {
    console.warn('[bpx player polyfill] pbp not found')
    return
  }
  const idData = {
    aid: pbp.options.aid.toString(),
    cid: pbp.options.cid.toString(),
    bvid: pbp.options.bvid,
  }
  if (Object.values(idData).some(it => it === '' || parseInt(it) <= 0)) {
    console.warn('[bpx player polyfill] invalid pbp data')
  }
  Object.assign(unsafeWindow, idData)
}
/** 移除番剧的双击全屏, 和视频区保持一致.
 * 如果以后视频区兼容了弹幕点赞层, 需要将双击全屏组件更换为阻止双击全屏, 并取消对此函数的使用.
 */
const doubleClickPolyfill = async () => {
  const layer = await select('.bpx-player-video-perch') as HTMLElement
  if (!layer) {
    return
  }
  preventEvent(layer, 'dblclick')
}
export const bpxPlayerPolyfill = lodash.once(async () => {
  if (!document.URL.startsWith('https://www.bilibili.com/bangumi/play/')) {
    return
  }
  playerModePolyfill()
  idPolyfill()
  doubleClickPolyfill()
})

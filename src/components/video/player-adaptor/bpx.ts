import { attributes } from '@/core/observer'
import { select } from '@/core/spin-query'
import { playerReady, preventEvent } from '@/core/utils'
import { createPlayerModeChangeEvent, PlayerMode } from './events'

const playerModePolyfill = async () => {
  await playerReady()
  const bpxContainer = (await select('.bpx-player-container')) as HTMLElement
  if (!bpxContainer) {
    console.warn('[bpx player polyfill] bpxContainer not found')
    return
  }
  let lastScreen = PlayerMode.Normal
  attributes(bpxContainer, () => {
    const dataScreen = bpxContainer.getAttribute('data-screen') as PlayerMode
    const prefix = 'player-mode-'
    const enumList = [
      PlayerMode.Normal,
      PlayerMode.WideScreen,
      PlayerMode.WebFullscreen,
      PlayerMode.Fullscreen,
    ].map(it => `${prefix}${it}`)

    // clear all class
    document.body.classList.remove(...enumList)

    // add class
    if (dataScreen !== PlayerMode.Normal) {
      document.body.classList.add(`${prefix}${dataScreen}`)
    }

    if (dataScreen !== lastScreen) {
      window.dispatchEvent(createPlayerModeChangeEvent(dataScreen))
      lastScreen = dataScreen
    }
  })
}
const idPolyfill = async () => {
  let pbp = await select(() => unsafeWindow.$pbp)
  if (!pbp) {
    console.warn('[bpx player polyfill] pbp not found')
    return
  }
  const loadPbpData = () => {
    const idData = {
      aid: pbp.options.aid.toString(),
      cid: pbp.options.cid.toString(),
      bvid: pbp.options.bvid,
    }
    if (Object.values(idData).some(it => !it || parseInt(it) <= 0)) {
      console.warn('[bpx player polyfill] invalid pbp data', pbp.options)
    }
    Object.assign(unsafeWindow, idData)
  }
  Object.defineProperty(unsafeWindow, '$pbp', {
    get() {
      return pbp
    },
    set(newValue) {
      pbp = newValue
      if (newValue === undefined) {
        return
      }
      Promise.resolve().then(() => loadPbpData())
    },
  })
  loadPbpData()
}
/** 移除 3.x 的双击全屏.
 * 如果以后视频区兼容了弹幕点赞层, 需要将双击全屏组件更换为阻止双击全屏, 并取消对此函数的使用.
 */
const doubleClickPolyfill = async () => {
  const layer = (await select('.bpx-player-video-perch')) as HTMLElement
  if (!layer) {
    return
  }
  preventEvent(layer, 'dblclick')
}
export const bpxPlayerPolyfill = lodash.once(async () => {
  // 番剧 + 3.x 播放器通用
  playerModePolyfill()
  doubleClickPolyfill()
  if (!document.URL.startsWith('https://www.bilibili.com/bangumi/play/')) {
    return
  }
  idPolyfill()
})

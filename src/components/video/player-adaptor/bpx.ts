import { attributes } from '@/core/observer'
import { select } from '@/core/spin-query'
import { playerReady, preventEvent } from '@/core/utils'
import { createPlayerModeChangeEvent, PlayerMode } from './events'

/** 播放器模式标记同步 */
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

/** 番剧 & 视频播放器 (BPX) 通用 polyfill */
export const bpxPlayerPolyfill = lodash.once(async () => {
  playerModePolyfill()
  doubleClickPolyfill()
})

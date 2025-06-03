import { attributes } from '@/core/observer'
import { select } from '@/core/spin-query'
import { playerReady } from '@/core/utils'
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

/** 番剧 & 视频播放器 (BPX) 通用 polyfill */
export const bpxPlayerPolyfill = lodash.once(async () => {
  playerModePolyfill()
})

import { childList } from '@/core/observer'
import { select } from '@/core/spin-query'
import { matchUrlPattern } from '@/core/utils'
import { liveUrls } from '@/core/utils/urls'

/**
 * 当直播的控制栏显示时, 执行回调, 可用于插入一些额外元素
 * (鼠标进入/移出会创建/销毁控制栏的DOM, 所以想要额外元素常驻就得用这种方式)
 * - init: 只执行一次
 * - callback: 每次控制栏创建时执行
 */
export const waitForControlBar = async (config: {
  init?: (container: HTMLElement) => void
  callback?: (controlBar: HTMLElement) => void
}) => {
  if (!liveUrls.some(url => matchUrlPattern(url))) {
    return
  }
  const controllerContainer = (await select(
    '.bilibili-live-player-video-controller, .web-player-controller-wrap:not(.web-player-controller-bg)',
  )) as HTMLDivElement
  if (!controllerContainer) {
    return
  }

  const { init, callback } = config
  init?.(controllerContainer)

  childList(controllerContainer, async () => {
    const controlBar = dq(controllerContainer, '.control-area')
    if (!controlBar) {
      return
    }
    callback?.(controlBar as HTMLElement)
  })
}

import { childListSubtree } from '@/core/observer'
import { select } from '@/core/spin-query'
import { raiseEvent } from '@/core/utils'
import { useScopedConsole } from '@/core/utils/log'
import { liveUrls, matchCurrentPage } from '@/core/utils/urls'

const controllerSelector =
  ':is(.bilibili-live-player-video-controller, .web-player-controller-wrap:not(.web-player-controller-bg))'
const controlBarSelector = `${controllerSelector} .control-area`

/**
 * 调出直播控制栏, 并执行回调. (调出后过一定时间会自动关闭)
 */
export const withControlBar = async (
  callback: (controlBar: HTMLElement) => void | Promise<void>,
) => {
  const livePlayer = (await select('.live-player-mounter')) as HTMLElement
  const console = useScopedConsole('withControlBar')
  if (!livePlayer) {
    console.warn('livePlayer not found')
    return
  }
  raiseEvent(livePlayer, 'mousemove')
  const controlBar = dq(livePlayer, controlBarSelector) as HTMLElement
  if (!controlBar) {
    console.warn('controlBar not found')
    return
  }
  await callback(controlBar)
  raiseEvent(livePlayer, 'mouseleave')
}
/**
 * 控制栏显示时执行回调, 可用于向控制栏插入常驻的额外元素
 * 控制栏的DOM会随鼠标移出销毁, 播放器重载也会重建, 因此监听稳定的播放器挂载点, 在其重建时重新插入
 * - init: 控制栏容器首次出现时执行一次
 * - callback: 控制栏每次显示时执行
 */
export const waitForControlBar = async (config: {
  init?: (container: HTMLElement) => void
  callback?: (controlBar: HTMLElement) => void
}) => {
  if (!matchCurrentPage(liveUrls)) {
    return
  }
  const player = (await select('.live-player-mounter')) as HTMLElement
  if (!player) {
    return
  }

  let initialized = false
  // 控制栏每次显示都会重建DOM, 用它本身判断是否是新出现的控制栏
  let lastControlBar: HTMLElement | null = null
  childListSubtree(player, () => {
    if (!initialized) {
      const controller = dq(player, controllerSelector)
      if (controller) {
        initialized = true
        config.init?.(controller as HTMLElement)
      }
    }
    const controlBar = dq(player, controlBarSelector) as HTMLElement
    if (controlBar === lastControlBar) {
      return
    }
    lastControlBar = controlBar
    if (controlBar) {
      config.callback?.(controlBar)
    }
  })
}

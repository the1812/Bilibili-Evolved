import { waitForControlBar } from '@/components/live/live-control-bar'
import { defineComponentMetadata } from '@/components/define'
import { select as spinSelect } from '@/core/spin-query'
import { addStyle, removeStyle } from '@/core/style'
import { liveUrls } from '@/core/utils/urls'
import componentStyle from './gift-box.scss'

/**
 * # 原理
 *
 * 在网页全屏模式、播放器控制条出现时将包裹按钮从原始位置直接移动到控制条上。退出全屏时再将包裹按钮移回原来的位置。
 *
 * 主要逻辑在各监听器中完成。监听器在 `entry` 和 `reload` 方法中启动，并在 `unload` 方法中停止监听。
 */

// 指示是否为全屏模式的 class，出现于 body 元素上
const fullWinClass = 'player-full-win'
const fullScreenClass = 'fullscreen-fix'

// 直播播放器的 id
const livePlayerId = 'live-player'

// 控制条类名
const controlBarClass = 'control-area'

// 包裹按钮元素的父元素 class
const giftBtnParentClass = 'z-gift-package'

// 包裹外层元素的 class
const giftPackageClass = 'wrap'

// 全屏模式下用于存放被移入的包裹按钮的容器元素
const fullWinGiftBtnWrapperClass = 'full-win-gift-btn-wrapper'

// 组件名
const componentName = 'liveGiftBox'

// 包裹按钮元素，仅当组件开启且能被寻找到时，才不为 null
let giftBtn: Element | null = null

// 全屏模式切换监听器
let stopObservingFullWinToggle: StopObservingCallback | null = null

// 鼠标离开播放器的监听器
let stopObservingMouseLeavePlayer: StopObservingCallback | null = null

interface FullWinToggleCallback {
  (
    // 标识监听到的动作是启动操作还是关闭操作
    isStarted: boolean,
  ): void
}

interface StopObservingCallback {
  (): void
}

async function queryGiftBtnParent(): Promise<Element | null> {
  const res = await spinSelect(`.${giftBtnParentClass}`, {
    maxRetry: 15,
    queryInterval: 200,
  })
  if (!res) {
    console.warn(`[${componentName}] the parent element of gift button not found`)
  }
  return res
}

// 当前是否为全屏模式
function isFullWin(): boolean {
  return (
    document.body.classList.contains(fullWinClass) ||
    document.body.classList.contains(fullScreenClass)
  )
}

/**
 * 监听全屏模式的开启与关闭，当模式发生变化时触发回调
 * @param callback 回调函数
 * @returns 停止监听的函数
 */
function observeFullWinToggle(onToggle: FullWinToggleCallback): StopObservingCallback {
  /**
   * 检查是否发生了全屏模式的变化
   * @param {MutationRecord} mutation body 元素的属性变化（不检查变化类型）
   * @returns {(boolean|null)} null 表示未切换模式，true 表示切换到全屏模式，false 表示切换到非全屏模式
   */
  function analyzeMutation(mutation: MutationRecord): boolean | null {
    const curContainsFullWinClass = isFullWin()
    const prevClassList = mutation.oldValue.split(' ')
    const prevContainsFullWinClass =
      prevClassList.includes(fullWinClass) || prevClassList.includes(fullScreenClass)
    // console.debug(`[${componentName}]`, { curContainsFullWinClass, prevContainsFullWinClass })
    if (curContainsFullWinClass === prevContainsFullWinClass) {
      return null
    }
    return curContainsFullWinClass
  }

  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      // console.debug(`[${componentName}] Class list of body element mutated. `
      //   + 'Analyzing to see if the full window mode has changed...')
      const toggleState = analyzeMutation(mutation)
      if (toggleState !== null) {
        onToggle(toggleState)
      }
    }
  })
  observer?.observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
    attributeOldValue: true,
  })
  return () => observer.disconnect()
}

// 将包裹按钮移动到控制条上
function moveGiftPackageToControlBar(controlBar: Element, giftBtn0: Element) {
  // console.debug(`[${componentName}] moving gift button to control bar...`)
  const rightArea = dq(controlBar, '.right-area')
  if (rightArea) {
    const wrapper = document.createElement('div')
    wrapper.className = fullWinGiftBtnWrapperClass
    wrapper.appendChild(giftBtn0)
    rightArea.appendChild(wrapper)
  } else {
    console.warn(`[${componentName}] .right-area could not be found in control bar`)
  }
}

// 每当控制条出现时，将包裹按钮移动到其上（条件：组件开启、包裹按钮存在、全屏模式开启）
function doOnControlBarAppear() {
  function onControlBarAppear(controlBar: Element) {
    const isFullWin0 = isFullWin()
    // console.debug(`[${componentName}] control bar appeared`, {
    //   '!!giftBtn': !!giftBtn,
    //   isFullWin: isFullWin0,
    // })
    if (giftBtn && isFullWin0) {
      moveGiftPackageToControlBar(controlBar, giftBtn)
    }
  }
  waitForControlBar({ callback: onControlBarAppear })
}

// 当全屏模式启动时，如果控制条正处于打开状态，则将包裹按钮移动到控制条上
function onFullWinStart(giftBtn0: Element) {
  const controlBar = dq(`.${controlBarClass}`)
  if (controlBar) {
    moveGiftPackageToControlBar(controlBar, giftBtn0)
  }
}

// 当全屏模式退出时，将包裹按钮移动回原位置，返回其监听器
function onFullWinClose(giftBtn0: Element, originGiftBtnParent: Element) {
  // console.debug(`[${componentName}] moving gift button back to origin position...`)
  originGiftBtnParent.appendChild(giftBtn0)
}

// 每当全屏模式切换时执行操作
function doOnFullWinToggle(giftBtn0: Element, originGiftBtnParent: Element): StopObservingCallback {
  return observeFullWinToggle(isStarted => {
    isStarted ? onFullWinStart(giftBtn0) : onFullWinClose(giftBtn0, originGiftBtnParent)
  })
}

// 监听鼠标离开播放器事件。当处于全屏模式且包裹处于打开状态时，关闭包裹
function doOnMouseLeavePlayer(giftBtn0: HTMLElement): StopObservingCallback {
  const livePlayer = dq(`#${livePlayerId}`)
  if (!livePlayer) {
    console.warn(`[${componentName}] live player not found`)
    return null
  }

  function onMouseLeavePlayer() {
    if (dq(`.${fullWinGiftBtnWrapperClass} .${giftPackageClass}`)) {
      // console.debug(`[${componentName}] Mouse left the full window player `
      //   + 'when the gift button is opening. Closing the gift package...')
      giftBtn0.click()
    }
  }

  livePlayer.addEventListener('mouseleave', onMouseLeavePlayer)
  return () => livePlayer.removeEventListener('mouseleave', onMouseLeavePlayer)
}

async function reload() {
  // console.debug(`[${componentName}] reloading...`)
  addStyle(componentStyle, componentName)

  const giftBtnParent = await queryGiftBtnParent()
  giftBtn = giftBtnParent?.children[0]

  if (giftBtnParent && giftBtn) {
    stopObservingFullWinToggle = doOnFullWinToggle(giftBtn, giftBtnParent)
    stopObservingMouseLeavePlayer = doOnMouseLeavePlayer(giftBtn as HTMLElement)
  }
}

function entry() {
  // console.debug(`[${componentName}] launching...`)
  doOnControlBarAppear()
  reload()
}

function unload() {
  // 不再使用全局变量设为 null，取消对对象的引用，便于垃圾回收
  // console.debug(`[${componentName}] unloading...`)
  stopObservingMouseLeavePlayer?.call(null)
  stopObservingMouseLeavePlayer = null
  stopObservingFullWinToggle?.call(null)
  stopObservingFullWinToggle = null
  giftBtn = null
  removeStyle(componentName)
}

export const component = defineComponentMetadata({
  name: componentName,
  displayName: '直播全屏包裹',
  description: {
    'zh-CN': '在直播的网页全屏(不能是全屏)模式下往控制栏添加包裹按钮.',
  },
  urlInclude: liveUrls,
  tags: [componentsTags.live],
  entry,
  reload,
  unload,
})

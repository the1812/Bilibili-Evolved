import { playerAgent } from '@/components/video/player-agent'
import { videoChange } from '@/core/observer'
import {
  addListener,
  calcOrder,
  extendedAgent,
  formatSpeedText,
  getAid,
  getExtendedSupportedRates,
  getSupportedRates,
  nativeSupportedRates,
  options,
  removeListeners,
  trimLeadingDot,
} from './utils'

const activeClassName = trimLeadingDot(extendedAgent.custom.active.selector)
const showClassName = trimLeadingDot(extendedAgent.custom.show.selector)

// 原生倍速，应该与官方播放器内部维护的值保持一致
let nativeSpeed: number
// 分 P 切换时共享前一个倍速，这里指定初始倍速可以是 undefined，不需要是 1
let sharedPreviousSpeed: number
// 分 P 切换时共享同一个倍速，这里指定初始倍速可以是 undefined，不需要是 1
let sharedSpeed: number
// 分 P 切换时共享同一个原生倍速值，初始值设置为 1
let sharedNativeSpeed = 1

let containerElement: HTMLElement
let menuListElement: HTMLElement
let videoElement: HTMLVideoElement
let nameBtn: HTMLButtonElement

const getRememberSpeed = (aid?: string) => {
  for (const [level, aids] of Object.entries(options.individualRememberList)) {
    if (aids.some(aid_ => aid_.toString() === getAid(aid).toString())) {
      return parseFloat(level)
    }
  }
  return null
}

const getFallbackVideoSpeed = () => {
  // 如果组件被启用才使用存储的后备值
  if (options.remember) {
    return parseFloat(options.speed)
  }
  return null
}

/**
 * 忘记对指定 aid 记忆的倍速，返回值表示指定的 aid 之前是否被记忆
 *
 * @param aid 要忘记的 aid，若不指定则从页面中自动获取
 */
const forgetSpeed = (aid?: string) => {
  aid = getAid(aid)

  let aidOldIndex = -1
  for (const aids of Object.values(options.individualRememberList)) {
    aidOldIndex = aids.indexOf(aid)
    if (aidOldIndex !== -1) {
      aids.splice(aidOldIndex, 1)
      break
    }
  }

  return aidOldIndex !== -1
}

/**
 * 为指定 aid 记忆指定倍速
 *
 * @param speed 要记忆的倍速
 * @param force 对于之前没有被记忆的 aid，**如果不将此参数设置为 `true`，调用完成也不会将相应的倍速记忆到设置中的**
 * @param aid 要记忆的 aid，若不指定则从页面中自动获取
 */
const rememberSpeed = (speed: number, force = false, aid?: string) => {
  aid = getAid(aid)
  const remembered = forgetSpeed(aid)
  // 对于没有被记忆的 aid，并且 force 参数为假就直接返回
  if (!remembered && !force) {
    return
  }
  // 为新的速度值初始化相应的 aid 数组
  if (!options.individualRememberList[speed]) {
    options.individualRememberList[speed] = []
  }
  // 追加记忆值
  options.individualRememberList[speed].push(aid)
}

const getSpeedMenuItem = (speed: number) => menuListElement.querySelector(`${extendedAgent.custom.speedMenuItem.selector}[data-value="${speed}"]`) as (HTMLElement | null)

/**
 * 设置视频倍速值，将返回当前的倍速
 *
 * @param speed 欲设置的倍速值
 */
const videoSpeed = (speed?: number) => {
  if (speed) {
    getSpeedMenuItem(speed)?.click()
    return speed
  }
  return videoElement.playbackRate
}

const setVideoSpeed = videoSpeed

/**
 * 重置视频倍速
 *
 * @param withForget 是否为附带清除视频记忆的重置倍速操作
 */
const resetVideoSpeed = (withForget = false) => {
  if (withForget) {
    const fallbackVideoSpeed = getFallbackVideoSpeed()
    // 如果 fallbackVideoSpeed 是 undefined，那么意味着没有开启记忆倍速功能
    // 考虑到与清除视频级别的倍速记忆功能的相关性，这里会忽略设定
    // 简单地说，如果没有开启记忆倍速的功能，就无法清除视频级别的倍速记忆
    if (!fallbackVideoSpeed) {
      return
    }
    forgetSpeed()
    setVideoSpeed(fallbackVideoSpeed)
  } else {
    setVideoSpeed(1)
  }
}

/**
 * 切换当前倍速
 *
 * 根据`mode`参数的不同有着不同的行为：
 *
 * - `mode === "smart"`（默认）：当前倍速等于 1.0x 时，切换到上次不同的视频倍速，否则重置倍速为 1.0x
 * - `mode === "classic"`：无论当前倍速如何，均切换到上次不同的视频倍速
 *
 * 重置倍速的行为可由 `reset()` 方法同款参数 `forget` 来控制
 *
 * @param forget 指示是否为清除视频记忆的重置倍速操作
 */
const toggleVideoSpeed = (mode: 'smart' | 'classic' = 'smart', forget = false) => {
  switch (mode) {
    case 'smart':
      videoSpeed() === 1 ? videoSpeed(sharedPreviousSpeed) : resetVideoSpeed(forget)
      break
    case 'classic':
      setVideoSpeed(sharedPreviousSpeed)
      break
    default:
      break
  }
}

const forceUpdate = (value: number) => {
  menuListElement.querySelector(`${extendedAgent.custom.speedMenuItem.selector}[data-value="${videoSpeed()}"]`)?.classList.remove(activeClassName)
  videoElement.playbackRate = value
  menuListElement.querySelector(`${extendedAgent.custom.speedMenuItem.selector}[data-value="${value}"]`)?.classList.add(activeClassName)
  containerElement.classList.remove(showClassName)
  nameBtn.innerText = formatSpeedText(value)
}

const setExtendedVideoSpeed = (speed: number) => {
  if (nativeSupportedRates.includes(speed)) {
    getSpeedMenuItem(speed)?.click()
  } else {
    forceUpdate(speed)
  }
}

const extendList = async () => {
  const { getExtraSpeedMenuItemElements } = await import('./extend')
  menuListElement.prepend(...await getExtraSpeedMenuItemElements())
  // 为所有原生倍速菜单项设置 Order
  menuListElement.querySelectorAll(`${extendedAgent.custom.speedMenuItem.selector}[data-value]:not(.extended)`).forEach(
    (it: HTMLLIElement) => { it.style.order = calcOrder(parseFloat(it.getAttribute('data-value') ?? '1')) },
  )
  // 如果开启了扩展倍速，存在一种场景使倍速设置会失效：
  //   1. 用户从原生支持的倍速切换到扩展倍速
  //   2. 用户从扩展倍速切换到之前选中的原生倍速
  // 这是因为播放器内部实现维护了一个速度值，但是在切换到扩展倍速时没法更新，因此切换回来的时候被判定没有发生变化
  // 为了解决这个问题，需要通过 forceUpdate 方法替官方更新元素，并为视频设置正确的倍速，最后关闭菜单
  addListener(menuListElement, ['click', ev => {
    const option = (ev.target as HTMLElement)
    const value = parseFloat(option.dataset.value as string)
    if ((ev.target as HTMLElement).classList.contains('extended')) {
      setExtendedVideoSpeed(value)
    }
    // 从扩展倍速切换到之前选中的原生倍速：强制更新！
    if (getExtendedSupportedRates().includes(videoSpeed()) && nativeSpeed === value) {
      forceUpdate(value)
    }
  }])
}

const extendListIfAllow = async () => {
  // 1. 根据 options 判断是否允许扩展倍速列表
  // 2. 如果已经打过标志 classname 的话，就不能再塞更多元素了
  if (!options.extend || containerElement.classList.contains('extended')) {
    return
  }
  await extendList()
  containerElement.classList.add('extended')
}

const addSpeedChangeEventListener = (cb: (previousSpeed: number, currentSpeed: number) => void) => {
  addListener(menuListElement, ['click', ev => {
    cb(sharedSpeed, parseFloat((ev.target as HTMLLIElement).dataset.value ?? '1'))
  }])
}

const dispatchChangedEvent = (previousSpeed: number, currentSpeed: number) => {
  const isNativeSpeed = nativeSupportedRates.includes(currentSpeed)
  containerElement.dispatchEvent(new CustomEvent('changed', { detail: { speed: currentSpeed, isNativeSpeed, previousSpeed } }))
}

export const createController = _.once(() => {
  videoChange(async () => {
    // 移除所有监听器
    removeListeners()
    // 重新获取页面元素
    const tmpContainerElement = await extendedAgent.custom.speedContainer()
    const tmpVideoElement = (await playerAgent.query.video.element()) as (HTMLVideoElement | null)
    if (!tmpContainerElement) {
      throw new Error('speed container element not found!')
    }
    if (!tmpVideoElement) {
      throw new Error('video element not found!')
    }
    containerElement = tmpContainerElement
    videoElement = tmpVideoElement
    nameBtn = containerElement.querySelector(
      extendedAgent.custom.speedNameBtn.selector,
    ) as HTMLButtonElement
    menuListElement = containerElement.querySelector(
      extendedAgent.custom.speedMenuList.selector,
    ) as HTMLElement
    // 试图插入扩展的倍速菜单项
    await extendListIfAllow()
    // 为每一个倍速菜单项附加 dataset
    menuListElement.querySelectorAll(extendedAgent.custom.speedMenuItem.selector).forEach(it => {
      if (!it.hasAttribute('data-value')) {
        const speed = parseFloat(it.textContent).toString()
        it.setAttribute('data-value', speed)
      }
    })
    // 还原共享值
    nativeSpeed = sharedNativeSpeed
    // 添加视频倍数变化监听
    addSpeedChangeEventListener(dispatchChangedEvent)
    // 视频倍数变化监听处理
    addListener(containerElement, ['changed', ({ detail: { speed, isNativeSpeed, previousSpeed } }: CustomEvent) => {
      // 记录（共享）倍速值
      sharedSpeed = speed
      if (isNativeSpeed) {
        sharedNativeSpeed = speed
        nativeSpeed = speed
      }
      // 原生支持倍速的应用后，需要清除扩展倍速选项上的样式
      if (options.extend && nativeSupportedRates.includes(speed)) {
        menuListElement.querySelector(`${extendedAgent.custom.speedMenuItem.selector}.extended${extendedAgent.custom.active.selector}`)?.classList.remove(activeClassName)
      }
      // 记忆
      // - `options.remember` 表示是否启用记忆
      // - `options.individualRemember` 表示是否启用细化到视频级别的记忆
      if (options.remember) {
        if (options.individualRemember) {
          rememberSpeed(
            speed,
            speed !== getFallbackVideoSpeed(),
          )
        } else {
          options.speed = speed.toString()
        }
      }
      // 刷新 sharedPreviousSpeed
      // - 用户可以通过倍速菜单或者倍速快捷键造成类似 1.5x 2.0x 2.0x... 这样的倍速设定序列
      //   我们不希望在第二个 2.0x 的时候刷新 this._previousSpeedVal，这样会比较死板
      //   判定依据在于 previousSpeed !== speed
      if (previousSpeed && previousSpeed !== speed) {
        sharedPreviousSpeed = previousSpeed
      }
    }])
    // 恢复记忆的倍速值
    // - 首次加载可能会遇到意外情况，导致内部强制更新失效，因此延时 100 ms 再触发速度设置
    setTimeout(() => {
      setVideoSpeed(
        (
          options.remember
          && options.individualRemember
          && getRememberSpeed()
        )
        || getFallbackVideoSpeed()
        || sharedSpeed,
      )
    }, 100)
  })
  return {
    getSupportedRates,
    getExtendedSupportedRates,
    setVideoSpeed,
    videoSpeed,
    getRememberSpeed,
    rememberSpeed,
    forgetSpeed,
    resetVideoSpeed,
    toggleVideoSpeed,
  }
})

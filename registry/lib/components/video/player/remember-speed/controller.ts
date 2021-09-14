/* Author: JLoeve (https://github.com/LonelySteve) */

import { allMutationsOn, videoChange } from '@/core/observer'
import { getComponentSettings } from '@/core/settings'
import { select } from '@/core/spin-query'
import { ascendingSort } from '@/core/utils/sort'
import { playerAgent } from '@/components/video/player-agent'

export const minValue = 0.0625
export const maxValue = 16
export const stepValue = 0.5
export const errorMessageDuration = 2000

export const calcOrder = (value: number) => ((maxValue - value) * 10000).toString()
const getAid = (aid = unsafeWindow.aid) => {
  if (!aid) {
    throw new Error('aid is unknown')
  }
  return aid
}

const rememberVideoSpeed = getComponentSettings('rememberVideoSpeed')
const options = rememberVideoSpeed.options as {
  speed: string
  extend: boolean
  extendList: number[]
  individualRemember: boolean
  individualRememberList: Record<string, string[]>
}

const extendedAgent = playerAgent.provideCustomQuery({
  video: {
    speedMenuList: 'bilibili-player-video-btn-speed-menu',
    speedMenuItem: 'bilibili-player-video-btn-speed-menu-list',
    speedNameBtn: 'bilibili-player-video-btn-speed-name',
    speedContainer: 'bilibili-player-video-btn-speed',
    active: 'bilibili-player-active',
    show: 'bilibili-player-speed-show',
  },
  bangumi: {
    speedMenuList: 'squirtle-speed-select-list',
    speedMenuItem: 'squirtle-select-item',
    speedNameBtn: 'squirtle-speed-select-result',
    speedContainer: 'squirtle-speed-wrap',
    active: 'active',
    // bangumi 那边没有这种 class, 随便填一个就行了
    show: 'bilibili-player-speed-show',
  },
})
const trimLeadingDot = (selector: string) => selector.replace(/^\./, '')

export class VideoSpeedController {
  static readonly classNameMap = {
    speedMenuList: trimLeadingDot(extendedAgent.custom.speedMenuList.selector),
    speedMenuItem: trimLeadingDot(extendedAgent.custom.speedMenuItem.selector),
    speedNameBtn: trimLeadingDot(extendedAgent.custom.speedNameBtn.selector),
    speedContainer: trimLeadingDot(extendedAgent.custom.speedContainer.selector),
    active: trimLeadingDot(extendedAgent.custom.active.selector),
    show: trimLeadingDot(extendedAgent.custom.show.selector),
    video: trimLeadingDot(extendedAgent.query.video.container.selector),
  }
  static readonly nativeSupportedRates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]
  static instanceMap = new WeakMap<HTMLElement, VideoSpeedController>()
  // 从低到高去重排序
  static get extendedSupportedRates() {
    return Array.from(new Set(options.extendList)).sort(ascendingSort())
  }
  static get supportedRates() {
    if (options.extend) {
      return [
        ...VideoSpeedController.nativeSupportedRates,
        ...VideoSpeedController.extendedSupportedRates,
      ].sort(ascendingSort())
    }
    return VideoSpeedController.nativeSupportedRates
  }

  /**
   * 获取后备默认速度
   */
  static get fallbackVideoSpeed() {
    // 向下兼容，原本 settings.defaultVideoSpeed 被设计为 string 类型，用于存储全局倍速
    if (rememberVideoSpeed.enabled) {
      return parseFloat(options.speed)
    }
    return null
  }

  static formatSpeedText(speed: number) {
    if (speed === 1) {
      return '倍速'
    }
    return Math.trunc(speed) === speed ? `${speed}.0x` : `${speed}x`
  }

  static getRememberSpeed(aid?: string) {
    for (const [level, aids] of Object.entries(options.individualRememberList)) {
      if (aids.some(aid_ => aid_ === getAid(aid))) {
        return parseFloat(level)
      }
    }
    return null
  }

  /**
   * 忘记对指定 aid 记忆的倍速，返回值表示指定的 aid 之前是否被记忆
   *
   * @param aid 要忘记的 aid，若不指定则从页面中自动获取
   */
  static forgetSpeed(aid?: string) {
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
  static rememberSpeed(speed: number, force = false, aid?: string) {
    aid = getAid(aid)
    const remembered = VideoSpeedController.forgetSpeed(aid)
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

  static async getInstance(previousSpeed?: number, nativeSpeed?: number) {
    const containerElement = await select(`.${VideoSpeedController.classNameMap.speedContainer}`) as HTMLElement
    const videoElement = await select(`.${VideoSpeedController.classNameMap.video} video`) as HTMLVideoElement

    if (!containerElement) {
      throw new Error('speed container element not found!')
    }
    if (!videoElement) {
      throw new Error('video element not found!')
    }

    return new VideoSpeedController(containerElement, videoElement, previousSpeed, nativeSpeed)
  }

  static init = lodash.once(() => {
    // 分 P 切换时共享同一个倍速，这里指定初始倍速可以是 undefined，不需要是 1
    let sharedSpeed: number
    // 分 P 切换时共享同一个原生倍速值，初始值设置为 1
    let sharedNativeSpeed = 1
    // 持有菜单容器元素的引用，videoChange 时更换（以前缓存的 VideoController 就没有意义了）
    let containerElement: HTMLElement

    videoChange(async () => {
      const { getExtraSpeedMenuItemElements } = await import('./extend')
      // 有必要传递之前的 nativeSpeedVal，跨分 P 时原生倍速将保持一样
      const controller = await VideoSpeedController.getInstance(sharedSpeed, sharedNativeSpeed)
      containerElement = controller.containerElement
      if (containerElement.classList.contains('extended')) {
        return
      }
      if (options.extend) {
        controller.menuListElement.prepend(...await getExtraSpeedMenuItemElements())
        // 为所有原生倍速菜单项设置 Order
        controller.menuListElement.querySelectorAll(`.${VideoSpeedController.classNameMap.speedMenuItem}[data-value]:not(.extended)`).forEach(
          (it: HTMLLIElement) => { it.style.order = calcOrder(parseFloat(it.getAttribute('data-value'))) },
        )
        // 如果开启了扩展倍速，存在一种场景使倍速设置会失效：
        //   1. 用户从原生支持的倍速切换到扩展倍速
        //   2. 用户从扩展倍速切换到之前选中的原生倍速
        // 这是因为播放器内部实现维护了一个速度值，但是在切换到扩展倍速时没法更新，因此切换回来的时候被判定没有发生变化
        // 为了解决这个问题，需要通过 forceUpdate 方法替官方更新元素，并为视频设置正确的倍速，并关闭菜单
        controller.menuListElement.addEventListener('click', ev => {
          const option = (ev.target as HTMLElement)
          const value = parseFloat(option.dataset.value as string)
          if ((ev.target as HTMLElement).classList.contains('extended')) {
            controller.setExtendedVideoSpeed(value)
          }
          // 从扩展倍速切换到之前选中的原生倍速
          if (
            VideoSpeedController.extendedSupportedRates.includes(controller.playbackRate)
            && controller.nativeSpeedVal === value
          ) {
            controller.forceUpdate(value)
          }
        })
      }
      controller.observe()
      containerElement.addEventListener('changed', ({ detail: { speed, isNativeSpeed } }: CustomEvent) => {
        sharedSpeed = speed
        if (isNativeSpeed) {
          sharedNativeSpeed = speed
        }
      })
      // 首次加载可能会遇到意外情况，导致内部强制更新失效，因此延时 100 ms 再触发速度设置
      setTimeout(() => {
        controller.setVideoSpeed(
          (
            rememberVideoSpeed.enabled
            && options.individualRemember
            && VideoSpeedController.getRememberSpeed()
          )
          || VideoSpeedController.fallbackVideoSpeed
          || sharedSpeed,
        )
      }, 100)
      containerElement.classList.add('extended')
    })
  })

  public readonly menuListElement: HTMLElement
  private nameBtn: HTMLButtonElement
  // 这个值模拟原生内部记录的速度倍速，它不应该被赋值成扩展倍速的值
  private nativeSpeedVal: number
  // 这个值用于表示上一次（上一P）的倍速值，如果是首次播放第一P，则为 undefined
  private previousSpeedVal?: number

  constructor(
    private readonly containerElement: HTMLElement,
    private readonly videoElement: HTMLVideoElement,
    previousSpeed?: number,
    nativeSpeed?: number,
  ) {
    const controller = VideoSpeedController.instanceMap.get(containerElement)
    if (controller
      && (!previousSpeed || controller.previousSpeedVal === previousSpeed)
      && (!nativeSpeed || controller.nativeSpeedVal === nativeSpeed)
    ) {
      return controller
    }

    this.previousSpeedVal = previousSpeed
    this.nativeSpeedVal = nativeSpeed ?? (
      previousSpeed && VideoSpeedController.nativeSupportedRates.includes(previousSpeed)
        ? previousSpeed
        : 1
    )
    this.nameBtn = this.containerElement.querySelector(`.${VideoSpeedController.classNameMap.speedNameBtn}`) as HTMLButtonElement
    this.menuListElement = this.containerElement.querySelector(`.${VideoSpeedController.classNameMap.speedMenuList}`) as HTMLElement
    this.menuListElement.querySelectorAll(`.${VideoSpeedController.classNameMap.speedMenuItem}`).forEach(it => {
      if (!it.hasAttribute('data-value')) {
        const speed = parseFloat(it.textContent).toString()
        it.setAttribute('data-value', speed)
      }
    })

    VideoSpeedController.instanceMap.set(containerElement, this)
  }

  get playbackRate() {
    return this.videoElement.playbackRate
  }

  getSpeedMenuItem(speed?: number) {
    if (speed) {
      return this.menuListElement.querySelector(`.${VideoSpeedController.classNameMap.speedMenuItem}[data-value="${speed}"]`) as HTMLElement
    }
    return this.menuListElement.querySelector(`.${VideoSpeedController.classNameMap.speedMenuItem}.${VideoSpeedController.classNameMap.active}`) as HTMLElement
  }

  observe() {
    allMutationsOn(this.menuListElement, mutations => {
      let [previousSpeed, currentSpeed]: [number?, number?] = [undefined, undefined]
      // 遍历所有的 mutations，获取上一个倍速值和当前倍速值（真正意义上的）
      mutations.forEach(mutation => {
        const selectedSpeedOption = mutation.target as HTMLLIElement

        if (!selectedSpeedOption.classList.contains(VideoSpeedController.classNameMap.active)) {
          previousSpeed = parseFloat(selectedSpeedOption.dataset.value ?? '1')
          return
        }

        currentSpeed = parseFloat(selectedSpeedOption.dataset.value ?? '1')

        let isNativeSpeed = false
        if (VideoSpeedController.nativeSupportedRates.includes(currentSpeed)) {
          this.nativeSpeedVal = currentSpeed
          isNativeSpeed = true
        }

        this.containerElement.dispatchEvent(new CustomEvent('changed', { detail: { speed: currentSpeed, isNativeSpeed, previousSpeed: this.previousSpeedVal } }))
        // 原生支持倍速的应用后，有必要清除扩展倍速选项上的样式
        if (
          options.extend
          && VideoSpeedController.nativeSupportedRates.includes(currentSpeed)
        ) {
          this.menuListElement.querySelector(`.${VideoSpeedController.classNameMap.speedMenuItem}.extended.${VideoSpeedController.classNameMap.active}`)?.classList.remove(VideoSpeedController.classNameMap.active)
        }
        // 记忆
        // - `rememberVideoSpeed.enabled` 表示是否启用记忆
        // - `options.individualRemember` 表示是否启用细化到视频级别的记忆
        if (rememberVideoSpeed.enabled) {
          if (options.individualRemember) {
            VideoSpeedController.rememberSpeed(
              currentSpeed,
              currentSpeed !== VideoSpeedController.fallbackVideoSpeed,
            )
          } else {
            options.speed = currentSpeed.toString()
          }
        }
      })
      // 刷新 this._previousSpeedVal
      // - 用户可以通过倍速菜单或者倍速快捷键造成类似 1.5x 2.0x 2.0x... 这样的倍速设定序列
      //   我们不希望在第二个 2.0x 的时候刷新 this._previousSpeedVal，这样会比较死板
      //   判定依据在于 previousSpeed !== currentSpeed
      if (previousSpeed && previousSpeed !== currentSpeed) {
        this.previousSpeedVal = previousSpeed
      }
    })
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
  toggleVideoSpeed(mode: 'smart' | 'classic' = 'smart', forget = false) {
    switch (mode) {
      case 'smart':
        this.playbackRate === 1 ? this.setVideoSpeed(this.previousSpeedVal) : this.reset(forget)
        break
      case 'classic':
        this.setVideoSpeed(this.previousSpeedVal)
        break
      default:
        break
    }
  }

  /**
   * 重置视频倍速
   *
   * @param forget 指示是否为清除视频记忆的重置倍速操作
   */
  reset(forget = false) {
    if (forget) {
      const { fallbackVideoSpeed } = VideoSpeedController
      // 如果 fallbackVideoSpeed 是 undefined，那么意味着没有开启记忆倍速功能
      // 考虑到与清除视频级别的倍速记忆功能的相关性，这里会忽略设定
      // 简单地说，如果没有开启记忆倍速的功能，就无法清除视频级别的倍速记忆
      if (!fallbackVideoSpeed) {
        return
      }
      VideoSpeedController.forgetSpeed()
      this.setVideoSpeed(fallbackVideoSpeed)
    } else {
      this.setVideoSpeed(1)
    }
  }

  setVideoSpeed(speed?: number) {
    speed && this.getSpeedMenuItem(speed).click()
  }

  private setExtendedVideoSpeed(speed: number) {
    if (VideoSpeedController.nativeSupportedRates.includes(speed)) {
      this.getSpeedMenuItem(speed).click()
    } else {
      this.forceUpdate(speed)
    }
  }

  private forceUpdate(value: number) {
    this.menuListElement.querySelector(`.${VideoSpeedController.classNameMap.speedMenuItem}[data-value="${this.playbackRate}"]`)?.classList.remove(VideoSpeedController.classNameMap.active)
    this.menuListElement.querySelector(`.${VideoSpeedController.classNameMap.speedMenuItem}[data-value="${value}"]`)?.classList.add(VideoSpeedController.classNameMap.active)
    this.videoElement.playbackRate = value
    this.containerElement.classList.remove(VideoSpeedController.classNameMap.show)
    this.nameBtn.innerText = VideoSpeedController.formatSpeedText(value)
  }
}

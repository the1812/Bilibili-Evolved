import { select } from '@/core/spin-query'
import { raiseEvent } from '@/core/utils'
import {
  ElementQuery,
  CustomNestedQuery,
  AgentType,
  PlayerQuery,
  CustomQuery,
  CustomQueryProvider,
  PlayerAgentEventTypes,
} from './types'

export const elementQuery = (selector: string): ElementQuery => {
  const func = () => select<HTMLElement>(selector)
  func.selector = selector
  func.sync = () => dq(selector) as HTMLElement
  return func
}
export const selectorWrap = (query: CustomNestedQuery<string>): CustomNestedQuery<ElementQuery> => {
  const map = (value: string | Record<string, any>): ElementQuery | Record<string, any> => {
    if (typeof value !== 'string') {
      return lodash.mapValues(value, map)
    }
    return elementQuery(value)
  }
  return lodash.mapValues(query, map) as CustomNestedQuery<ElementQuery>
}
export const click = (target: ElementQuery) => {
  const button = target.sync()
  button?.click()
  return button
}

export abstract class PlayerAgent
  extends EventTarget
  implements EnumEventTarget<`${PlayerAgentEventTypes}`>
{
  isBpxPlayer = true

  abstract type: AgentType
  abstract query: PlayerQuery<ElementQuery>

  constructor() {
    super()
  }

  provideCustomQuery<CustomQueryType extends CustomQuery<string>>(
    config: CustomQueryProvider<CustomQueryType>,
  ) {
    const custom = selectorWrap(config[this.type] ?? config.video) as CustomQuery<ElementQuery>
    return {
      ...this,
      custom,
    } as this & { custom: { [key in keyof CustomQueryType]: ElementQuery } }
  }
  widescreen() {
    return click(this.query.control.buttons.widescreen)
  }
  webFullscreen() {
    return click(this.query.control.buttons.webFullscreen)
  }
  fullscreen() {
    return click(this.query.control.buttons.fullscreen)
  }
  togglePlay() {
    return click(this.query.control.buttons.start)
  }
  togglePip() {
    return click(this.query.control.buttons.pip)
  }
  toggleMute() {
    return click(this.query.control.buttons.volume)
  }
  toggleDanmaku() {
    const checkbox = this.query.danmakuSwitch.sync() as HTMLInputElement
    if (!checkbox) {
      return null
    }
    checkbox.checked = !checkbox.checked
    raiseEvent(checkbox, 'change')
    return checkbox.checked
  }

  /** true 开灯，false 关灯 */
  async toggleLight(on?: boolean) {
    if (!this.nativeApi) {
      return null
    }
    const isCurrentLightOff = this.nativeApi.getLightOff()
    // 无指定参数, 直接 toggle
    if (on === undefined) {
      this.nativeApi.setLightOff(!isCurrentLightOff)
      return !isCurrentLightOff
    }
    // 关灯状态 && 要开灯 -> 开灯
    if (on && isCurrentLightOff) {
      this.nativeApi.setLightOff(false)
      return true
    }
    if (!on && !isCurrentLightOff) {
      this.nativeApi.setLightOff(true)
      return false
    }
    return null
  }

  getPlayerConfig<DefaultValueType = unknown, ValueType = DefaultValueType>(
    target: string,
    defaultValue?: DefaultValueType,
  ): ValueType | DefaultValueType {
    const storageKey = this.isBpxPlayer ? 'bpx_player_profile' : 'bilibili_player_settings'
    return lodash.get(JSON.parse(localStorage.getItem(storageKey)), target, defaultValue)
  }

  isAutoPlay() {
    return this.getPlayerConfig('video_status.autoplay')
  }

  // https://github.com/the1812/Bilibili-Evolved/discussions/4341
  get nativeApi() {
    return unsafeWindow.player || unsafeWindow.playerRaw
  }

  get nanoApi() {
    return unsafeWindow.nano
  }

  get nanoTypeMap(): Record<PlayerAgentEventTypes, string> {
    return {
      [PlayerAgentEventTypes.Play]: this.nanoApi.EventType.Player_Play,
      [PlayerAgentEventTypes.Pause]: this.nanoApi.EventType.Player_Pause,
    }
  }

  private eventHandlerMap = new Map<
    EventListenerOrEventListenerObject,
    {
      handler: EventListener
      options: boolean | AddEventListenerOptions
    }
  >()

  addEventListener(
    type: `${PlayerAgentEventTypes}`,
    callback: EventListener,
    options?: boolean | AddEventListenerOptions,
  ): void {
    super.addEventListener(type, callback, options)
    const registerHandler = (nanoType: string) => {
      if (typeof options === 'object' && options.once) {
        this.nativeApi.once(nanoType, callback)
      } else {
        this.nativeApi.on(nanoType, callback)
      }
      this.eventHandlerMap.set(callback, {
        handler: callback,
        options,
      })
    }
    const nanoType = this.nanoTypeMap[type]
    if (!nanoType) {
      console.warn('[PlayerAgent] unknown event type', type)
      return
    }
    registerHandler(nanoType)
  }

  removeEventListener(
    type: `${PlayerAgentEventTypes}`,
    callback: EventListener,
    options?: boolean | EventListenerOptions,
  ): void {
    super.removeEventListener(type, callback, options)
    const unregisterHandler = (nanoType: string) => {
      const handlerData = this.eventHandlerMap.get(callback)
      if (!handlerData || lodash.isEqual(options, handlerData.options)) {
        return
      }
      this.nativeApi.off(nanoType, handlerData.handler)
    }
    const nanoType = this.nanoTypeMap[type]
    if (!nanoType) {
      return
    }
    unregisterHandler(nanoType)
  }

  /** 获取是否静音 */
  isMute() {
    if (!this.nativeApi) {
      return null
    }
    if (this.nativeApi.isMuted) {
      return this.nativeApi.isMuted()
    }
    return this.nativeApi.isMute()
  }
  /** 更改音量 (%) */
  changeVolume(change: number) {
    if (!this.nativeApi) {
      return null
    }
    if (this.nativeApi.getVolume) {
      const current = this.nativeApi.getVolume()
      this.nativeApi.setVolume(current + change / 100)
      return Math.round(this.nativeApi.getVolume() * 100)
    }
    const current = this.nativeApi.volume()
    this.nativeApi.volume(current + change / 100)
    return Math.round(this.nativeApi.volume() * 100)
  }
  /** 跳转到指定时间 */
  seek(time: number) {
    if (!this.nativeApi) {
      return null
    }
    this.nativeApi.seek(time)
    return this.nativeApi.getCurrentTime() as number
  }
  /** 更改时间 */
  changeTime(change: number) {
    if (!this.nativeApi) {
      return null
    }
    const video = this.query.video.element.sync() as HTMLVideoElement
    if (!video) {
      return null
    }
    this.nativeApi.seek(video.currentTime + change, video.paused)
    return this.nativeApi.getCurrentTime()
  }
}

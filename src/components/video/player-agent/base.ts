/* eslint-disable class-methods-use-this */
import { select } from '@/core/spin-query'
import { raiseEvent } from '@/core/utils'
import {
  ElementQuery,
  CustomNestedQuery,
  AgentType,
  PlayerQuery,
  CustomQuery,
  CustomQueryProvider,
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

export enum PlayerAgentEventTypes {
  Play = 'play',
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
      this.nativeApi.setLightOff(true)
      return true
    }
    if (!on && !isCurrentLightOff) {
      this.nativeApi.setLightOff(false)
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

  private eventHandlerMap = new Map<
    EventListenerOrEventListenerObject,
    {
      handler: () => void
      options: boolean | AddEventListenerOptions
    }
  >()

  addEventListener(
    type: `${PlayerAgentEventTypes}`,
    callback: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void {
    super.addEventListener(type, callback, options)
    switch (type) {
      default: {
        break
      }
      case PlayerAgentEventTypes.Play: {
        const handler = () => {
          this.dispatchEvent(new Event(PlayerAgentEventTypes.Play))
        }
        if (typeof options === 'object' && options.once) {
          this.nativeApi.once(this.nanoApi.EventType.Player_Initialized, handler)
        } else {
          this.nativeApi.on(this.nanoApi.EventType.Player_Initialized, handler)
        }
        this.eventHandlerMap.set(callback, {
          handler,
          options,
        })
      }
    }
  }

  removeEventListener(
    type: `${PlayerAgentEventTypes}`,
    callback: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void {
    super.removeEventListener(type, callback, options)
    switch (type) {
      default: {
        break
      }
      case PlayerAgentEventTypes.Play: {
        const handlerData = this.eventHandlerMap.get(callback)
        if (!handlerData || lodash.isEqual(options, handlerData.options)) {
          break
        }
        this.nativeApi.off(this.nanoApi.EventType.Player_Initialized, handlerData.handler)
      }
    }
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

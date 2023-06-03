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
export abstract class PlayerAgent {
  abstract type: AgentType
  abstract query: PlayerQuery<ElementQuery>
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
    const checkbox = (await this.query.control.settings.lightOff()) as HTMLInputElement
    // 无指定参数, 直接 toggle
    if (on === undefined) {
      checkbox.click()
      return
    }
    // 关灯状态 && 要开灯 -> 开灯
    checkbox.checked && on && checkbox.click()
    // 开灯状态 && 要关灯 -> 关灯
    !checkbox.checked && !on && checkbox.click()
  }

  // eslint-disable-next-line class-methods-use-this
  getPlayerConfig(target: string) {
    return lodash.get(JSON.parse(localStorage.getItem('bilibili_player_settings')), target, false)
  }

  isAutoPlay() {
    return this.getPlayerConfig('video_status.autoplay')
  }

  abstract isMute(): boolean
  /** 更改音量 (%) */
  abstract changeVolume(change: number): number
  /** 跳转到指定时间 */
  abstract seek(time: number): number
  /** 更改时间 */
  abstract changeTime(change: number): number
}

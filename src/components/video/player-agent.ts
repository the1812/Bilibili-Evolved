import { select } from '@/core/spin-query'
import { isBwpVideo, raiseEvent } from '@/core/utils'
import { bangumiUrls, matchCurrentPage } from '@/core/utils/urls'
import { bpxPlayerPolyfill } from './player-adaptor/bpx'
import { v3PlayerPolyfill } from './player-adaptor/v3'

/** 元素查询函数, 调用时执行 `SpinQuery.select` 查询, 可访问 `selector` 获取选择器 */
type ElementQuery<Target = HTMLElement> = {
  (): Promise<Target | null>
  sync: () => Target | null
  selector: string
}
interface CustomNestedQuery<QueryResult> {
  [key: string]: QueryResult | CustomNestedQuery<QueryResult>
}
interface CustomQuery<QueryResult> extends CustomNestedQuery<QueryResult> {
  [key: string]: QueryResult
}
type AgentType = 'video' | 'bangumi'
type CustomQueryProvider<TargetType> = {
  [key in AgentType]?: TargetType
} & { video: TargetType }
interface PlayerQuery<QueryResult> extends CustomNestedQuery<QueryResult> {
  playerWrap: QueryResult
  bilibiliPlayer: QueryResult
  playerArea: QueryResult
  video: {
    element: QueryResult
    wrap: QueryResult
    top: QueryResult
    state: QueryResult
    panel: QueryResult
    popup: QueryResult
    subtitle: QueryResult
    basDanmaku: QueryResult
    advDanmaku: QueryResult
    danmaku: QueryResult
    container: QueryResult
  }
  control: {
    element: QueryResult
    wrap: QueryResult
    mask: QueryResult
    top: QueryResult
    progress: QueryResult
    bottom: QueryResult
    bottomLeft: QueryResult
    bottomCenter: QueryResult
    bottomRight: QueryResult
    buttons: {
      start: QueryResult
      next: QueryResult
      time: QueryResult
      quality: QueryResult
      pageList: QueryResult
      speed: QueryResult
      subtitle: QueryResult
      volume: QueryResult
      settings: QueryResult
      pip: QueryResult
      widescreen: QueryResult
      webFullscreen: QueryResult
      fullscreen: QueryResult
    }
    settings: {
      wrap: QueryResult,
      lightOff: QueryResult
    }
  }
  toastWrap: QueryResult
  danmakuTipLayer: QueryResult
  danmakuSwitch: QueryResult
}
const elementQuery = (selector: string): ElementQuery => {
  const func = () => select<HTMLElement>(selector)
  func.selector = selector
  func.sync = () => dq(selector) as HTMLElement
  return func
}
const selectorWrap = (query: CustomNestedQuery<string>): CustomNestedQuery<ElementQuery> => {
  const map = (value: string | Record<string, any>): ElementQuery | Record<string, any> => {
    if (typeof value !== 'string') {
      return lodash.mapValues(value, map)
    }
    return elementQuery(value)
  }
  return lodash.mapValues(query, map) as CustomNestedQuery<ElementQuery>
}
const click = (target: ElementQuery) => {
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
    } as (this & { custom: { [key in keyof CustomQueryType]: ElementQuery } })
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
  async toggleLight(on: boolean) {
    const checkbox = await this.query.control.settings.lightOff() as HTMLInputElement
    // 关灯状态 && 要开灯 -> 开灯
    checkbox.checked && on && checkbox.click()
    // 开灯状态 && 要关灯 -> 关灯
    !checkbox.checked && !on && checkbox.click()
  }

  // eslint-disable-next-line class-methods-use-this
  getPlayerConfig(target: string) {
    return lodash.get(
      JSON.parse(localStorage.getItem('bilibili_player_settings')),
      target,
      false,
    )
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
export class VideoPlayerV2Agent extends PlayerAgent {
  // eslint-disable-next-line class-methods-use-this
  get nativeApi() {
    return unsafeWindow.player
  }
  type: AgentType = 'video'
  query = selectorWrap({
    playerWrap: '.player-wrap',
    bilibiliPlayer: '.bilibili-player',
    playerArea: '.bilibili-player-area',
    video: {
      element: '.bilibili-player-video video',
      wrap: '.bilibili-player-video-wrap',
      top: '.bilibili-player-video-top',
      state: '.bilibili-player-video-state',
      panel: '.bilibili-player-video-panel',
      popup: '.bilibili-player-video-popup',
      subtitle: '.bilibili-player-video-subtitle',
      basDanmaku: '.bilibili-player-video-bas-danmaku',
      advDanmaku: '.bilibili-player-video-adv-danmaku',
      danmaku: '.bilibili-player-video-danmaku',
      container: '.bilibili-player-video',
    },
    control: {
      element: '.bilibili-player-control',
      wrap: '.bilibili-player-control-wrap',
      mask: '.bilibili-player-control-mask',
      top: '.bilibili-player-control-top',
      progress: '.bilibili-player-video-progress',
      bottom: '.bilibili-player-control-bottom',
      bottomLeft: '.bilibili-player-control-bottom-left',
      bottomCenter: '.bilibili-player-control-bottom-center',
      bottomRight: '.bilibili-player-control-bottom-right',
      buttons: {
        start: '.bilibili-player-video-btn-start',
        next: '.bilibili-player-video-btn-next',
        time: '.bilibili-player-video-time',
        quality: '.bilibili-player-btn-quality',
        pageList: '.bilibili-player-video-btn-pagelist',
        speed: '.bilibili-player-video-btn-speed',
        subtitle: '.bilibili-player-video-btn-subtitle',
        volume: '.bilibili-player-video-btn-volume .bilibili-player-iconfont-volume',
        settings: '.bilibili-player-video-btn-setting',
        pip: '.bilibili-player-video-btn-pip',
        widescreen: '.bilibili-player-video-btn-widescreen',
        webFullscreen: '.bilibili-player-video-web-fullscreen',
        fullscreen: '.bilibili-player-video-btn-fullscreen',
      },
      settings: {
        wrap: '.bilibili-player-video-btn-setting-wrap',
        lightOff: '.bilibili-player-video-btn-setting-right-others-content-lightoff .bui-checkbox-input',
      },
    },
    toastWrap: '.bilibili-player-video-toast-wrp',
    danmakuTipLayer: '.bilibili-player-dm-tip-wrap',
    danmakuSwitch: '.bilibili-player-video-danmaku-switch input',
  }) as PlayerQuery<ElementQuery>

  constructor() {
    super()
    this.checkBwpVideo()
  }
  checkBwpVideo() {
    const videoSelector = this.query.video.element.selector
    const bwpSelector = '.bilibili-player-video bwp-video'
    this.query.video.element = (() => {
      const func = async () => {
        if (await isBwpVideo()) {
          return select<HTMLElement>(bwpSelector)
        }
        return select<HTMLElement>(videoSelector)
      }
      func.selector = videoSelector
      func.sync = () => dq(videoSelector) as HTMLElement
      isBwpVideo().then(bwp => {
        if (!bwp) {
          return
        }
        func.selector = bwpSelector
        func.sync = () => dq(bwpSelector) as HTMLElement
      })
      return func
    })()
  }

  isMute() {
    if (!this.nativeApi) {
      return null
    }
    return this.nativeApi.isMute()
  }
  changeVolume(change: number) {
    if (!this.nativeApi) {
      return null
    }
    const current = this.nativeApi.volume()
    this.nativeApi.volume(current + change / 100)
    return Math.round(this.nativeApi.volume() * 100)
  }
  seek(time: number) {
    if (!this.nativeApi) {
      return null
    }
    this.nativeApi.play()
    setTimeout(() => {
      this.nativeApi.seek(time)
      const toastText = dq('.bilibili-player-video-toast-bottom .bilibili-player-video-toast-item:first-child .bilibili-player-video-toast-item-text span:nth-child(2)')
      if (toastText) {
        toastText.textContent = ' 00:00'
      }
    })
    return this.nativeApi.getCurrentTime()
  }
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
export class BangumiPlayerAgent extends PlayerAgent {
  type: AgentType = 'bangumi'
  query = selectorWrap({
    playerWrap: '.player-module',
    bilibiliPlayer: '.bpx-player-container',
    playerArea: '.bpx-player-primary-area',
    video: {
      element: '.bpx-player-video-wrap video',
      wrap: '.bpx-player-video-area',
      top: '.bpx-player-top-wrap',
      state: '.bpx-player-state-wrap',
      panel: '.bpx-player-ending-panel',
      popup: '.bpx-player-dialog-wrap',
      subtitle: '.bpx-player-subtitle-wrap',
      basDanmaku: '.bpx-player-bas-dm-wrap',
      advDanmaku: '.bpx-player-adv-dm-wrap',
      danmaku: '.bpx-player-row-dm-wrap',
      container: '.bpx-player-video-wrap',
    },
    control: {
      element: '.squirtle-controller',
      wrap: '.bpx-player-control-wrap',
      mask: '.bpx-player-control-mask',
      top: '.bpx-player-control-top',
      progress: '.squirtle-progress-wrap',
      bottom: '.squirtle-controller-wrap',
      bottomLeft: '.squirtle-controller-wrap-left',
      bottomCenter: '.squirtle-controller-wrap-center',
      bottomRight: '.squirtle-controller-wrap-right',
      buttons: {
        start: '.squirtle-video-start',
        next: '.squirtle-video-next',
        time: '.squirtle-time-wrap',
        quality: '.squirtle-video-quality',
        pageList: '.squirtle-video-pagelist',
        speed: '.squirtle-video-speed',
        subtitle: '.squirtle-video-subtitle',
        volume: '.squirtle-video-volume .squirtle-volume-icon',
        settings: '.squirtle-video-setting',
        pip: '.squirtle-video-pip',
        widescreen: '.squirtle-video-widescreen',
        webFullscreen: '.squirtle-video-pagefullscreen',
        fullscreen: '.squirtle-video-fullscreen',
      },
      settings: {
        wrap: '.squirtle-setting-wrap',
        lightOff: '.squirtle-lightoff',
      },
    },
    toastWrap: '.bpx-player-tooltip-area',
    danmakuTipLayer: '.bpx-player-dialog-wrap',
    danmakuSwitch: '.bpx-player-dm-switch input',
  }) as PlayerQuery<ElementQuery>
  constructor() {
    super()
    bpxPlayerPolyfill()
  }
  isMute() {
    const icon = this.query.control.buttons.volume.sync() as HTMLElement
    return icon?.classList.contains('squirtle-volume-mute-state') ?? false
  }
  changeVolume(change: number) {
    const video = this.query.video.element.sync() as HTMLVideoElement
    if (!video) {
      return null
    }
    video.volume = lodash.clamp(video.volume + change / 100, 0, 1)
    return Math.round(video.volume * 100)
  }
  seek(time: number) {
    const video = this.query.video.element.sync() as HTMLVideoElement
    if (!video) {
      return null
    }
    video.play()
    setTimeout(() => {
      video.currentTime = lodash.clamp(time, 0, video.duration)
      const toastText = dq('.bpx-player-toast-row .bpx-player-toast-item .bpx-player-toast-text')
      if (toastText?.textContent?.startsWith('已为您定位至')) {
        toastText.textContent = '已为您定位至00:00'
      }
    })
    return video.currentTime
  }
  changeTime(change: number) {
    const video = this.query.video.element.sync() as HTMLVideoElement
    if (!video) {
      return null
    }
    video.currentTime = lodash.clamp(video.currentTime + change, 0, video.duration)
    return video.currentTime
  }
  async toggleLight(on: boolean) {
    const checkbox = this.query.control.settings.lightOff.sync()
    //  开灯状态 && 关灯 -> 关灯
    !checkbox.classList.contains('active') && !on && checkbox.click()
    // 关灯状态 && 开灯 -> 开灯
    checkbox.classList.contains('active') && on && checkbox.click()
  }
}
export class VideoPlayerMixedAgent extends VideoPlayerV2Agent {
  query = selectorWrap({
    playerWrap: '.player-wrap',
    bilibiliPlayer: '.bilibili-player,#bilibili-player',
    playerArea: '.bilibili-player-area,.bpx-player-primary-area',
    video: {
      element: '.bilibili-player-video video,.bpx-player-video-wrap video',
      wrap: '.bilibili-player-video-wrap,.bpx-player-video-area',
      top: '.bilibili-player-video-top,.bpx-player-top-wrap',
      state: '.bilibili-player-video-state,.bpx-player-state-wrap',
      panel: '.bilibili-player-video-panel,.bpx-player-ending-panel',
      popup: '.bilibili-player-video-popup,.bpx-player-dialog-wrap',
      subtitle: '.bilibili-player-video-subtitle,.bpx-player-subtitle-wrap',
      basDanmaku: '.bilibili-player-video-bas-danmaku,.bpx-player-bas-dm-wrap',
      advDanmaku: '.bilibili-player-video-adv-danmaku,.bpx-player-adv-dm-wrap',
      danmaku: '.bilibili-player-video-danmaku,.bpx-player-row-dm-wrap',
      container: '.bilibili-player-video,.bpx-player-video-wrap',
    },
    control: {
      element: '.bilibili-player-control,.bpx-player-control-entity',
      wrap: '.bilibili-player-control-wrap,.bpx-player-control-wrap',
      mask: '.bilibili-player-control-mask,.bpx-player-control-mask',
      top: '.bilibili-player-control-top,.bpx-player-control-top',
      progress: '.bilibili-player-video-progress,.bpx-player-progress',
      bottom: '.bilibili-player-control-bottom,.bpx-player-control-bottom',
      bottomLeft: '.bilibili-player-control-bottom-left,,.bpx-player-control-bottom-left',
      bottomCenter: '.bilibili-player-control-bottom-center,.bpx-player-control-bottom-center',
      bottomRight: '.bilibili-player-control-bottom-right,.bpx-player-control-bottom-right',
      buttons: {
        start: '.bilibili-player-video-btn-start,.bpx-player-ctrl-play',
        next: '.bilibili-player-video-btn-next,.bpx-player-ctrl-btn-next',
        time: '.bilibili-player-video-time,.bpx-player-ctrl-time',
        quality: '.bilibili-player-btn-quality,.bpx-player-ctrl-quality',
        pageList: '.bilibili-player-video-btn-pagelist,.bpx-player-ctrl-eplist',
        speed: '.bilibili-player-video-btn-speed,.bpx-player-ctrl-playbackrate',
        subtitle: '.bilibili-player-video-btn-subtitle,.bpx-player-ctrl-subtitle',
        volume: '.bilibili-player-video-btn-volume .bilibili-player-iconfont-volume,.bpx-player-ctrl-volume .bpx-player-ctrl-volume-icon',
        settings: '.bilibili-player-video-btn-setting,.bpx-player-ctrl-setting',
        pip: '.bilibili-player-video-btn-pip,.bpx-player-ctrl-pip',
        widescreen: '.bilibili-player-video-btn-widescreen,.bpx-player-ctrl-wide',
        webFullscreen: '.bilibili-player-video-web-fullscreen,.bpx-player-ctrl-web',
        fullscreen: '.bilibili-player-video-btn-fullscreen,.bpx-player-ctrl-full',
      },
      settings: {
        wrap: '.bilibili-player-video-btn-setting-wrap,.bpx-player-ctrl-setting-box',
        lightOff: '.bilibili-player-video-btn-setting-right-others-content-lightoff .bui-checkbox-input,.bpx-player-ctrl-setting-lightoff .bui-checkbox-input',
      },
    },
    toastWrap: '.bilibili-player-video-toast-wrp,.bpx-player-dialog-wrap',
    danmakuTipLayer: '.bilibili-player-dm-tip-wrap,.bpx-player-dm-tip',
    danmakuSwitch: '.bilibili-player-video-danmaku-switch input,.bpx-player-dm-switch input',
  }) as PlayerQuery<ElementQuery>

  constructor() {
    super()
    this.checkBwpVideo()
    v3PlayerPolyfill()
  }

  seek(time: number) {
    if (!this.nativeApi) {
      return null
    }
    this.nativeApi.play()
    setTimeout(() => {
      this.nativeApi.seek(time)
      const toastText = dq('.bilibili-player-video-toast-bottom .bilibili-player-video-toast-item:first-child .bilibili-player-video-toast-item-text span:nth-child(2)')
      if (toastText) {
        toastText.textContent = ' 00:00'
      }
    })
    return this.nativeApi.getCurrentTime()
  }
}

export const playerAgent = (() => {
  if (matchCurrentPage(bangumiUrls)) {
    return new BangumiPlayerAgent()
  }
  return new VideoPlayerMixedAgent()
})()

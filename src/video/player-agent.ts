/** 元素查询函数, 调用时执行 `SpinQuery.select` 查询, 可访问 `selector` 获取选择器 */
type ElementQuery<Target = HTMLElement> = {
  (): Promise<Target | null>
  selector: string
}
interface CustomNestedQuery<QueryResult> {
  [key: string]: QueryResult | CustomNestedQuery<QueryResult>
}
interface CustomQuery<QueryResult> extends CustomNestedQuery<QueryResult> {
  [key: string]: QueryResult
}
type AgentType = 'video' | 'bwp' | 'bangumi'
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
  }
  toastWrap: QueryResult
  danmakuTipLayer: QueryResult
  danmakuSwitch: QueryResult
}
const select = (selector: string): ElementQuery => {
  const func = () => SpinQuery.select(selector)
  func.selector = selector
  return func
}
const selectorWrap = (query: CustomNestedQuery<string>): CustomNestedQuery<ElementQuery> => {
  const map = (value: string | Record<string, any>): ElementQuery | Record<string, any> => {
    if (typeof value !== 'string') {
      return _.mapValues(value, map)
    }
    return select(value)
  }
  return _.mapValues(query, map) as CustomNestedQuery<ElementQuery>
}
export abstract class PlayerAgent {
  abstract type: AgentType
  abstract query: PlayerQuery<ElementQuery>
  protected async click(target: () => Promise<HTMLElement | null>) {
    const button = await target()
    button?.click()
  }
  provideCustomQuery<CustomQueryType extends CustomQuery<string>>(config: CustomQueryProvider<CustomQueryType>) {
    const custom = selectorWrap(config[this.type] ?? config.video) as CustomQuery<ElementQuery>
    return { ...this, custom } as (this & { custom: { [key in keyof CustomQueryType]: ElementQuery } })
  }
  async widescreen() {
    await this.click(this.query.control.buttons.widescreen)
  }
  async webFullscreen() {
    await this.click(this.query.control.buttons.webFullscreen)
  }
  async fullscreen() {
    await this.click(this.query.control.buttons.fullscreen)
  }
  async togglePlay() {
    await this.click(this.query.control.buttons.start)
  }
  async togglePip() {
    await this.click(this.query.control.buttons.pip)
  }
  async toggleMute() {
    await this.click(this.query.control.buttons.volume)
  }
  async toggleDanmaku() {
    const checkbox = await this.query.danmakuSwitch() as HTMLInputElement
    if (!checkbox) {
      return
    }
    checkbox.checked = !checkbox.checked
    raiseEvent(checkbox, 'change')
  }
  abstract isMute(): Promise<boolean>
  /** 更改音量 (%) */
  abstract changeVolume(change: number): Promise<number>
  /** 跳转到指定时间 */
  abstract seek(time: number): Promise<number>
  /** 更改时间 */
  abstract changeTime(change: number): Promise<number>
}
export class VideoPlayerAgent extends PlayerAgent {
  type: AgentType = 'video'
  get nativeApi() { return unsafeWindow.player }
  query = selectorWrap({
    playerWrap: '.player-wrap',
    bilibiliPlayer: '.bilibili-player',
    playerArea: '.bilibili-player-area',
    video: {
      element: 'video',
      wrap: '.bilibili-player-video-wrap',
      top: '.bilibili-player-top',
      state: '.bilibili-player-state',
      panel: '.bilibili-player-video-panel',
      popup: '.bilibili-player-video-popup',
      subtitle: '.bilibili-player-video-subtitle',
      basDanmaku: '.bilibili-player-bas-danmaku',
      advDanmaku: '.bilibili-player-adv-danmaku',
      danmaku: '.bilibili-player-danmaku',
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
      }
    },
    toastWrap: '.bilibili-player-video-toast-wrp',
    danmakuTipLayer: '.bilibili-player-dm-tip-wrap',
    danmakuSwitch: '.bilibili-player-video-danmaku-switch input',
  }) as PlayerQuery<ElementQuery>
  async isMute() {
    return this.nativeApi.isMute()
  }
  async changeVolume(change: number) {
    const current = this.nativeApi.volume()
    this.nativeApi.volume(current + change / 100)
    return Math.round(this.nativeApi.volume() * 100)
  }
  async seek(time: number) {
    this.nativeApi.play()
    setTimeout(() => {
      this.nativeApi.seek(time)
      const toastText = dq(".bilibili-player-video-toast-bottom .bilibili-player-video-toast-item:first-child .bilibili-player-video-toast-item-text span:nth-child(2)")
      if (toastText) {
        toastText.textContent = " 00:00"
      }
    })
    return this.nativeApi.getCurrentTime()
  }
  async changeTime(change: number) {
    const video = await this.query.video.element() as HTMLVideoElement
    this.nativeApi.seek(video.currentTime + change, video.paused)
    return this.nativeApi.getCurrentTime()
  }
}
export class BwpPlayerAgent extends VideoPlayerAgent {
  type: AgentType = 'bwp'
  constructor() {
    super()
    this.query.video.element = select('bwp-video')
  }
}
export class BangumiPlayerAgent extends PlayerAgent {
  type: AgentType = 'bangumi'
  query = selectorWrap({
    playerWrap: '.player-module',
    bilibiliPlayer: '.bpx-player-container',
    playerArea: '.bpx-player-primary-area',
    video: {
      element: 'video',
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
      }
    },
    toastWrap: '.bpx-player-tooltip-area',
    danmakuTipLayer: '.bpx-player-dialog-wrap',
    danmakuSwitch: '.bpx-player-dm-switch input',
  }) as PlayerQuery<ElementQuery>
  async isMute() {
    const icon = await this.query.control.buttons.volume() as HTMLElement
    return icon?.classList.contains('squirtle-volume-mute-state') ?? false
  }
  async changeVolume(change: number) {
    const video = await this.query.video.element() as HTMLVideoElement
    video.volume = _.clamp(video.volume + change / 100, 0, 1)
    return Math.round(video.volume * 100)
  }
  async seek(time: number) {
    const video = await this.query.video.element() as HTMLVideoElement
    video.play()
    setTimeout(() => {
      video.currentTime = _.clamp(time, 0, video.duration)
      const toastText = dq('.bpx-player-toast-row .bpx-player-toast-item .bpx-player-toast-text')
      if (toastText?.textContent?.startsWith('已为您定位至')) {
        toastText.textContent = '已为您定位至00:00'
      }
    })
    return video.currentTime
  }
  async changeTime(change: number) {
    const video = await this.query.video.element() as HTMLVideoElement
    video.currentTime = _.clamp(video.currentTime + change, 0, video.duration)
    return video.currentTime
  }
}

export const playerAgent = (() => {
  if (document.URL.includes('//www.bilibili.com/bangumi/play')) {
    return new BangumiPlayerAgent()
  }
  if (unsafeWindow.__ENABLE_WASM_PLAYER__) {
    return new BwpPlayerAgent()
  }
  return new VideoPlayerAgent()
})()

export default {
  export: {
    playerAgent,
  }
}

type ElementQuery<Target = HTMLElement> = () => Promise<Target | null>
interface PlayerQuery<QueryResult> {
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
}
export interface PlayerAgent {
  query: PlayerQuery<ElementQuery>
}
export abstract class PlayerAgentBase implements PlayerAgent {
  abstract query: PlayerQuery<ElementQuery>
  async widescreen() {
    const button = await this.query.control.buttons.widescreen()
    button?.click()
  }
  async webFullscreen() {
    const button = await this.query.control.buttons.webFullscreen()
    button?.click()
  }
  async fullscreen() {
    const button = await this.query.control.buttons.fullscreen()
    button?.click()
  }
}

const select = (selector: string) => () => SpinQuery.select(selector)
const selectorWrap = (query: PlayerQuery<string>): PlayerQuery<ElementQuery> => {
  const map = (value: string | Record<string, any>): ElementQuery | Record<string, any> => {
    if (typeof value !== 'string') {
      return _.mapValues(value, map)
    }
    return select(value)
  }
  return _.mapValues(query, map) as PlayerQuery<ElementQuery>
}
export class VideoPlayerAgent extends PlayerAgentBase {
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
        start: '.bilibili-player-btn-start',
        next: '.bilibili-player-video-btn-next',
        time: '.bilibili-player-video-time',
        quality: '.bilibili-player-btn-quality',
        pageList: '.bilibili-player-video-btn-pagelist',
        speed: '.bilibili-player-video-btn-speed',
        subtitle: '.bilibili-player-video-btn-subtitle',
        volume: '.bilibili-player-video-btn-volume',
        settings: '.bilibili-player-video-btn-setting',
        pip: '.bilibili-player-video-btn-pip',
        widescreen: '.bilibili-player-video-btn-widescreen',
        webFullscreen: '.bilibili-player-video-btn-web-fullscreen',
        fullscreen: '.bilibili-player-video-btn-fullscreen',
      }
    },
    toastWrap: '.bilibili-player-video-toast-wrp',
    danmakuTipLayer: '.bilibili-player-dm-tip-wrap',
  })
}
export class BwpPlayerAgent extends VideoPlayerAgent {
  constructor() {
    super()
    this.query.video.element = select('bwp-video')
  }
}
export class BangumiPlayerAgent extends PlayerAgentBase {
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
        time: '.squirtle-video-time',
        quality: '.squirtle-video-quality',
        pageList: '.squirtle-video-pagelist',
        speed: '.squirtle-video-speed',
        subtitle: '.squirtle-video-subtitle',
        volume: '.squirtle-video-volume',
        settings: '.squirtle-video-setting',
        pip: '.squirtle-video-pip',
        widescreen: '.squirtle-video-widescreen',
        webFullscreen: '.squirtle-video-pagefullscreen',
        fullscreen: '.squirtle-video-fullscreen',
      }
    },
    toastWrap: '.bpx-player-tooltip-area',
    danmakuTipLayer: '.bpx-player-dialog-wrap',
  })
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
    VideoPlayerAgent,
    BangumiPlayerAgent,
    BwpPlayerAgent,
    playerAgent,
  }
}

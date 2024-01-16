import { isBwpVideo } from '@/core/utils'
import { PlayerAgent, selectorWrap } from './base'
import { PlayerQuery, ElementQuery, AgentType } from './types'
import { select } from '@/core/spin-query'

export class VideoPlayerBpxAgent extends PlayerAgent {
  type: AgentType = 'video'

  // spell-checker: disable
  query = selectorWrap({
    playerWrap: '.player-wrap',
    bilibiliPlayer: '#bilibili-player',
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
      container: '.bpx-player-video-perch',
    },
    control: {
      element: '.bpx-player-control-entity',
      wrap: '.bpx-player-control-wrap',
      mask: '.bpx-player-control-mask',
      top: '.bpx-player-control-top',
      progress: '.bpx-player-progress',
      bottom: '.bpx-player-control-bottom',
      bottomLeft: '.bpx-player-control-bottom-left',
      bottomCenter: '.bpx-player-control-bottom-center',
      bottomRight: '.bpx-player-control-bottom-right',
      buttons: {
        start: '.bpx-player-ctrl-play',
        next: '.bpx-player-ctrl-btn-next',
        time: '.bpx-player-ctrl-time',
        quality: '.bpx-player-ctrl-quality',
        pageList: '.bpx-player-ctrl-eplist',
        speed: '.bpx-player-ctrl-playbackrate',
        subtitle: '.bpx-player-ctrl-subtitle > div > span',
        volume: '.bpx-player-ctrl-volume-icon',
        settings: '.bpx-player-ctrl-setting',
        pip: '.bpx-player-ctrl-pip',
        widescreen: '.bpx-player-ctrl-wide',
        webFullscreen: '.bpx-player-ctrl-web',
        fullscreen: '.bpx-player-ctrl-full',
      },
      settings: {
        wrap: '.bpx-player-ctrl-setting-box',
        lightOff: '.bpx-player-ctrl-setting-lightoff .bui-checkbox-input',
      },
    },
    toastWrap: '.bpx-player-dialog-wrap',
    danmakuTipLayer: '.bpx-player-dm-tip',
    danmakuSwitch: '.bpx-player-dm-switch input',
  }) as PlayerQuery<ElementQuery>
  // spell-checker: enable

  constructor() {
    super()
    this.checkBwpVideo()
  }

  checkBwpVideo() {
    const videoSelector = this.query.video.element.selector
    const bwpSelector = '.bilibili-player-video bwp-video,.bpx-player-video-area bwp-video'
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
}

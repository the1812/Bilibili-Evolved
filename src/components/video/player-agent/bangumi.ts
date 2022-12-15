import { bpxPlayerPolyfill } from '../player-adaptor/bpx'
import { PlayerAgent, selectorWrap } from './base'
import { AgentType, PlayerQuery, ElementQuery } from './types'

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

import { select } from '@/core/spin-query'
import { isBwpVideo } from '@/core/utils'
import { PlayerAgent, selectorWrap } from './base'
import { AgentType, PlayerQuery, ElementQuery } from './types'

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
        lightOff:
          '.bilibili-player-video-btn-setting-right-others-content-lightoff .bui-checkbox-input',
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

  isMute() {
    if (!this.nativeApi) {
      return null
    }
    if (this.nativeApi.isMuted) {
      return this.nativeApi.isMuted()
    }
    return this.nativeApi.isMute()
  }
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
  seek(time: number) {
    if (!this.nativeApi) {
      return null
    }
    this.nativeApi.play()
    setTimeout(() => {
      this.nativeApi.seek(time)
      const toastText = dq(
        '.bilibili-player-video-toast-bottom .bilibili-player-video-toast-item:first-child .bilibili-player-video-toast-item-text span:nth-child(2)',
      )
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

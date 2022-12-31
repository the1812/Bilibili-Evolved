import { v3PlayerPolyfill } from '../player-adaptor/v3'
import { selectorWrap } from './base'
import { PlayerQuery, ElementQuery } from './types'
import { VideoPlayerV2Agent } from './video-player-v2'

export class VideoPlayerMixedAgent extends VideoPlayerV2Agent {
  query = selectorWrap({
    playerWrap: '.player-wrap',
    bilibiliPlayer: '.bilibili-player, #bilibili-player',
    playerArea: '.bilibili-player-area, .bpx-player-primary-area',
    video: {
      element: '.bilibili-player-video video, .bpx-player-video-wrap video',
      wrap: '.bilibili-player-video-wrap, .bpx-player-video-area',
      top: '.bilibili-player-video-top, .bpx-player-top-wrap',
      state: '.bilibili-player-video-state, .bpx-player-state-wrap',
      panel: '.bilibili-player-video-panel, .bpx-player-ending-panel',
      popup: '.bilibili-player-video-popup, .bpx-player-dialog-wrap',
      subtitle: '.bilibili-player-video-subtitle, .bpx-player-subtitle-wrap',
      basDanmaku: '.bilibili-player-video-bas-danmaku, .bpx-player-bas-dm-wrap',
      advDanmaku: '.bilibili-player-video-adv-danmaku, .bpx-player-adv-dm-wrap',
      danmaku: '.bilibili-player-video-danmaku, .bpx-player-row-dm-wrap',
      container: '.bilibili-player-video, .bpx-player-video-perch',
    },
    control: {
      element: '.bilibili-player-control, .bpx-player-control-entity',
      wrap: '.bilibili-player-control-wrap, .bpx-player-control-wrap',
      mask: '.bilibili-player-control-mask, .bpx-player-control-mask',
      top: '.bilibili-player-control-top, .bpx-player-control-top',
      progress: '.bilibili-player-video-progress, .bpx-player-progress',
      bottom: '.bilibili-player-control-bottom, .bpx-player-control-bottom',
      bottomLeft: '.bilibili-player-control-bottom-left, ,.bpx-player-control-bottom-left',
      bottomCenter: '.bilibili-player-control-bottom-center, .bpx-player-control-bottom-center',
      bottomRight: '.bilibili-player-control-bottom-right, .bpx-player-control-bottom-right',
      buttons: {
        start: '.bilibili-player-video-btn-start, .bpx-player-ctrl-play',
        next: '.bilibili-player-video-btn-next, .bpx-player-ctrl-btn-next',
        time: '.bilibili-player-video-time, .bpx-player-ctrl-time',
        quality: '.bilibili-player-btn-quality, .bpx-player-ctrl-quality',
        pageList: '.bilibili-player-video-btn-pagelist, .bpx-player-ctrl-eplist',
        speed: '.bilibili-player-video-btn-speed, .bpx-player-ctrl-playbackrate',
        subtitle: '.bilibili-player-video-btn-subtitle, .bpx-player-ctrl-subtitle > div > span',
        volume:
          '.bilibili-player-video-btn-volume .bilibili-player-iconfont-volume, .bpx-player-ctrl-volume .bpx-player-ctrl-volume-icon',
        settings: '.bilibili-player-video-btn-setting, .bpx-player-ctrl-setting',
        pip: '.bilibili-player-video-btn-pip, .bpx-player-ctrl-pip',
        widescreen: '.bilibili-player-video-btn-widescreen, .bpx-player-ctrl-wide',
        webFullscreen: '.bilibili-player-video-web-fullscreen, .bpx-player-ctrl-web',
        fullscreen: '.bilibili-player-video-btn-fullscreen, .bpx-player-ctrl-full',
      },
      settings: {
        wrap: '.bilibili-player-video-btn-setting-wrap, .bpx-player-ctrl-setting-box',
        lightOff:
          '.bilibili-player-video-btn-setting-right-others-content-lightoff .bui-checkbox-input, .bpx-player-ctrl-setting-lightoff .bui-checkbox-input',
      },
    },
    toastWrap: '.bilibili-player-video-toast-wrp, .bpx-player-dialog-wrap',
    danmakuTipLayer: '.bilibili-player-dm-tip-wrap, .bpx-player-dm-tip',
    danmakuSwitch: '.bilibili-player-video-danmaku-switch input, .bpx-player-dm-switch input',
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
      const toastText = dq(
        '.bilibili-player-video-toast-bottom .bilibili-player-video-toast-item:first-child .bilibili-player-video-toast-item-text span:nth-child(2)',
      )
      if (toastText) {
        toastText.textContent = ' 00:00'
      }
    })
    return this.nativeApi.getCurrentTime()
  }
}

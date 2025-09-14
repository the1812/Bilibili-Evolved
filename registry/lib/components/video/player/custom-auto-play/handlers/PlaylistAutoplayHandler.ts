import { matchUrlPattern } from '@/core/utils'
import { AutoplayActionType } from '../AutoplayActionType'
import { BaseAutoplayHandler } from './BaseAutoplayHandler'

/** 自动连播处理器-视频合集 */
export class PlaylistAutoplayHandler extends BaseAutoplayHandler {
  type = '视频合集'

  async match() {
    const videoUrl = '//www.bilibili.com/video/'
    const list = document.querySelector('.video-pod .section')
    const btn = document.querySelector('.video-pod .auto-play .switch-btn')
    return matchUrlPattern(videoUrl) && list != null && btn != null
  }

  protected override getSequentialNumberString(): string {
    return document.querySelector('.video-pod__header .amt').innerHTML
  }

  async shouldAutoplay() {
    return BaseAutoplayHandler.shouldAutoplayWithAutoHandler(
      BaseAutoplayHandler.settings.options.playlistAutoplayAction as AutoplayActionType,
      () => !this.isLastSequentialNumber(),
    )
  }

  async setupAutoPlay(enable: boolean) {
    await this.setupAutoPlay_SwitchBtn(enable)
  }
}

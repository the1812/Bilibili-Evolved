import { matchUrlPattern } from '@/core/utils'
import { AutoplayActionType } from '../AutoplayActionType'
import { BaseAutoplayHandler } from './BaseAutoplayHandler'

/** 自动连播处理器-分P视频 */
export class MultipartAutoplayHandler extends BaseAutoplayHandler {
  type = '分P视频'

  /** 是否为带自动播放切换按钮的旧版界面 */
  private isLegacyLayout() {
    return document.querySelector('.video-pod .auto-play .switch-btn') !== null
  }

  async match() {
    const videoUrl = '//www.bilibili.com/video/'
    const list = document.querySelector('.video-pod .multip')
    return matchUrlPattern(videoUrl) && list !== null
  }

  protected override getSequentialNumberString(): string {
    return document.querySelector('.video-pod__header .amt').innerHTML
  }

  async shouldAutoplay() {
    return BaseAutoplayHandler.shouldAutoplayWithAutoHandler(
      BaseAutoplayHandler.settings.options.multipartAutoplayAction as AutoplayActionType,
      () => !this.isLastSequentialNumber(),
    )
  }

  async setupAutoPlay(enable: boolean) {
    if (this.isLegacyLayout()) {
      await this.setupAutoPlay_SwitchBtn(enable)
      return
    }
    await this.setupAutoPlay_Player(enable)
  }
}

import { matchUrlPattern } from '@/core/utils'
import { AutoplayActionType } from '../AutoplayActionType'
import { BaseAutoplayHandler } from './BaseAutoplayHandler'

/** 自动连播处理器-视频合集 */
export class PlaylistAutoplayHandler extends BaseAutoplayHandler {
  type = '视频合集'

  /** 是否为带自动播放切换按钮的旧版界面 */
  private isLegacyLayout() {
    return document.querySelector('.video-pod .auto-play .switch-btn') !== null
  }

  /** 是否为带订阅合集按钮的新版界面 */
  private isNewLayout() {
    return document.querySelector('.video-pod .subscribe-btn') !== null
  }

  async match() {
    const videoUrl = '//www.bilibili.com/video/'
    const list = document.querySelector('.video-pod .section')
    return (
      matchUrlPattern(videoUrl) && list !== null && (this.isLegacyLayout() || this.isNewLayout())
    )
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
    if (this.isNewLayout()) {
      await this.setupAutoPlay_Player(enable)
      return
    }
    await this.setupAutoPlay_SwitchBtn(enable)
  }
}

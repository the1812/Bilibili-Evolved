import { matchUrlPattern } from '@/core/utils'
import { AutoplayActionType } from '../AutoplayActionType'
import { BaseAutoplayHandler } from './base-autoplay-handler'

/** 自动连播处理器-推荐视频（接下来播放） */
export class RecommendAutoplayHandler extends BaseAutoplayHandler {
  type = '推荐视频（接下来播放）'

  async match() {
    const videoUrl = '//www.bilibili.com/video/'
    const btn = document.querySelector('.recommend-list-v1 .switch-btn')
    return matchUrlPattern(videoUrl) && btn !== null
  }

  async shouldAutoplay() {
    return BaseAutoplayHandler.shouldAutoplayWithAutoHandler(
      BaseAutoplayHandler.settings.options.recommendAutoplayAction as AutoplayActionType,
      () => false,
    )
  }

  async setupAutoplay(enable: boolean) {
    await this.setupAutoplaySwitchButton(enable)
  }
}

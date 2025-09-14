import { matchUrlPattern } from '@/core/utils'
import { AutoplayActionType } from '../AutoplayActionType'
import { BaseAutoplayHandler } from './BaseAutoplayHandler'

/** 自动连播处理器-推荐视频 */
export class RecommendAutoplayHandler extends BaseAutoplayHandler {
  type = '推荐视频'

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

  async setupAutoPlay(enable: boolean) {
    await this.setupAutoPlay_SwitchBtn(enable)
  }
}

import { matchUrlPattern } from '@/core/utils'
import { favoriteListUrls } from '@/core/utils/urls'
import { AutoplayActionType } from '../AutoplayActionType'
import { BaseAutoplayHandler } from './BaseAutoplayHandler'

/** 自动连播处理器-收藏夹 */
export class FavoriteAutoplayHandler extends BaseAutoplayHandler {
  type = '收藏夹'

  async match() {
    return favoriteListUrls.some(url => matchUrlPattern(url))
  }

  protected override getSequentialNumberString(): string {
    return document.querySelector('.list-count').innerHTML
  }

  async shouldAutoplay() {
    return BaseAutoplayHandler.shouldAutoplayWithAutoHandler(
      BaseAutoplayHandler.settings.options.favoriteAutoplayAction as AutoplayActionType,
      () => !this.isLastSequentialNumber(),
    )
  }

  async setupAutoPlay(enable: boolean) {
    await this.setupAutoPlay_SwitchBtn(enable)
  }
}

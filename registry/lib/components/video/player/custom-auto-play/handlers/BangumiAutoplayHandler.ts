import { matchUrlPattern } from '@/core/utils'
import { bangumiUrls } from '@/core/utils/urls'
import { AutoplayActionType } from '../AutoplayActionType'
import { BaseAutoplayHandler } from './BaseAutoplayHandler'

/** 自动连播处理器-番剧 */
export class BangumiAutoplayHandler extends BaseAutoplayHandler {
  type = '番剧'

  async match() {
    return bangumiUrls.some(url => matchUrlPattern(url))
  }

  protected override getSequentialNumberString(): string {
    return document.querySelector('.plp-r span[class^=eplist_ep_list_progress]').innerHTML
  }

  protected override isLastSequentialNumber(): boolean {
    // 正片有分P序号，使用默认逻辑
    if (this.getSequentialNumberString().length > 0) {
      return super.isLastSequentialNumber()
    }

    // PV、小剧场没有分P序号，因此统一用元素位置判断
    const el = document
      .querySelector('.plp-r img[class^=PlayingIcon_playIcon]')
      .closest('div[class^=imageListItem_wrap]')
    return !el.nextElementSibling
  }

  async shouldAutoplay() {
    return BaseAutoplayHandler.shouldAutoplayWithAutoHandler(
      BaseAutoplayHandler.settings.options.bangumiAutoplayAction as AutoplayActionType,
      () => !this.isLastSequentialNumber(),
    )
  }

  async setupAutoPlay(enable: boolean) {
    await this.setupAutoPlay_Player(enable)
  }
}

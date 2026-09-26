import { matchUrlPattern } from '@/core/utils'
import { watchlaterUrls } from '@/core/utils/urls'
import { AutoplayActionType } from '../AutoplayActionType'
import { BaseAutoplayHandler } from './base-autoplay-handler'

/** 自动连播处理器-稍后再看 */
export class WatchLaterAutoplayHandler extends BaseAutoplayHandler {
  type = '稍后再看'

  async match() {
    return watchlaterUrls.some(url => matchUrlPattern(url))
  }

  protected override getSequentialNumberString(): string {
    return document.querySelector('.list-count').innerHTML
  }

  async shouldAutoplay() {
    return BaseAutoplayHandler.shouldAutoplayWithAutoHandler(
      BaseAutoplayHandler.settings.options.watchLaterAutoplayAction as AutoplayActionType,
      () => !this.isLastSequentialNumber(),
    )
  }

  async setupAutoplay(enable: boolean) {
    await this.setupAutoplaySwitchButton(enable)
  }
}

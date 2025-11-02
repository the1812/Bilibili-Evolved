import { matchUrlPattern } from '@/core/utils'
import { AutoplayActionType } from '../AutoplayActionType'
import { BaseAutoplayHandler } from './BaseAutoplayHandler'
import { bangumiUrls, favoriteListUrls, watchlaterUrls } from '@/core/utils/urls'

/** 自动连播处理器-推荐视频（列表第一个） */
export class RecommendListAutoplayHandler extends BaseAutoplayHandler {
  type = '推荐视频（列表第一个）'

  async match() {
    const videoUrl = '//www.bilibili.com/video/'
    let matchUrl = matchUrlPattern(videoUrl)
    matchUrl = matchUrl || bangumiUrls.some(url => matchUrlPattern(url))
    matchUrl = matchUrl || favoriteListUrls.some(url => matchUrlPattern(url))
    matchUrl = matchUrl || watchlaterUrls.some(url => matchUrlPattern(url))

    return matchUrl && this.getFirstRecommend() !== null
  }

  async shouldAutoplay() {
    return BaseAutoplayHandler.shouldAutoplayWithAutoHandler(
      BaseAutoplayHandler.settings.options.recommendListAutoplayAction as AutoplayActionType,
      () => false,
    )
  }

  /** 视频结束回调 */
  private onVideoEnded = () => {
    const a = this.getFirstRecommend() as HTMLElement
    window.location.assign(a.getAttribute('href'))
  }

  async setupAutoPlay(enable: boolean) {
    const video = document.querySelector('video')
    if (!video) {
      return
    }

    if (enable) {
      video.addEventListener('ended', this.onVideoEnded, { once: true })
    } else {
      video.removeEventListener('ended', this.onVideoEnded)
    }
  }

  /** 获取推荐视频列表首个视频链接 */
  getFirstRecommend() {
    return document.querySelector(
      '.rec-list .pic a,.recommend-list-container .pic-box a,.plp-r div[class^=RecommendItem_wrap] a',
    )
  }
}

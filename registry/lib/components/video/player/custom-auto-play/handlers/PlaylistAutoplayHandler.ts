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

  /** 获取合集当前分集内嵌的分P进度 */
  private getNestedMultipartProgress() {
    const currentBvid = document.URL.match(/\/video\/(BV[\dA-Za-z]+)/)?.[1]
    if (!currentBvid) {
      return null
    }

    const podItems = Array.from(
      document.querySelectorAll<HTMLElement>('.video-pod__list.section .video-pod__item'),
    )
    const currentPodItem = podItems.find(
      item => item.dataset.key === currentBvid || item.dataset.bsbBvid === currentBvid,
    )
    if (!currentPodItem) {
      return null
    }

    const totalPages = currentPodItem.querySelectorAll('.page-list .page-item').length
    if (totalPages <= 1) {
      return null
    }

    const pageFromUrl = Number.parseInt(new URL(document.URL).searchParams.get('p') ?? '1')
    const currentPage = Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1
    return { currentPage, totalPages }
  }

  async shouldAutoplay() {
    const nestedMultipartProgress = this.getNestedMultipartProgress()
    // 当前分集内还有下一P时由分P视频设置控制；到达最后一P后再由合集设置控制
    if (
      nestedMultipartProgress &&
      nestedMultipartProgress.currentPage < nestedMultipartProgress.totalPages
    ) {
      return BaseAutoplayHandler.shouldAutoplayWithAutoHandler(
        BaseAutoplayHandler.settings.options.multipartAutoplayAction as AutoplayActionType,
        () => true,
      )
    }

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

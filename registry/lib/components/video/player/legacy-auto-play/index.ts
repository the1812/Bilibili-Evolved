import { defineComponentMetadata } from '@/components/define'
import { playerAgent } from '@/components/video/player-agent'
import { childListSubtree, videoChange } from '@/core/observer'
import { select, sq } from '@/core/spin-query'
import { matchUrlPattern, playerReady } from '@/core/utils'
import { useScopedConsole } from '@/core/utils/log'
import { bangumiUrls, mediaListUrls, videoUrls } from '@/core/utils/urls'

abstract class LegacyAutoPlay {
  async onRightPanelLoaded(callback: (rightPanel: Element) => Promise<void> | void) {
    await playerReady()
    const rightPanel = await Promise.any([
      select('.right-container-inner'),
      select('.playlist-container--right'),
      select('.video-pod'),
    ])
    if (!rightPanel) {
      const console = useScopedConsole('传统连播模式')
      console.warn('未找到 rightPanelContainer 或 playListContainer')
      return
    }
    callback(rightPanel)
  }
  async onVideoChange(callback: () => Promise<void> | void) {
    videoChange(async () => {
      const video = (await playerAgent.query.video.element()) as HTMLVideoElement
      video?.addEventListener('play', () => callback(), { once: true })
    })
  }
  abstract setupAutoPlay(): Promise<void>
}

class VideoLegacyAutoPlay extends LegacyAutoPlay {
  /** 到达最后一项时关闭连播 */
  readonly disableConditions = [
    // 新版分 P / 合集
    () => this.isLastPodItem(),
    // 旧版分 P
    () => Boolean(dq(':is(.multi-page, .multi-page-v1) .list-box li.on:last-child')),
    // 旧版合集
    () =>
      Boolean(
        dq(
          '.video-sections-item:last-child .video-episode-card:last-child :is(.video-episode-card__info-playing, .video-episode-card__info-title-playing)',
        ),
      ),
  ]

  isLastPodItem() {
    const [current, total] = (dq('.video-pod__header .amt')?.textContent.match(/\d+/g) ?? []).map(
      it => parseInt(it),
    )
    if (!(current >= total)) {
      return false
    }
    // 合集内嵌分 P 还需判断分集内进度
    const activePage = dq(
      '.video-pod__list .page-list > .active, .video-pod__list .page-list > .multip-list-item-active',
    )
    return activePage === null || activePage === activePage.parentElement?.lastElementChild
  }

  /** 媒体列表最后一项是否为当前项 */
  isLastListItem(item: Element) {
    const isSingle =
      item.classList.contains('singlep-list-item-inner') || item.querySelector('.single-p') !== null
    if (isSingle) {
      return (
        item.classList.contains('siglep-active') ||
        item.querySelector('.simple-base-item.active') !== null
      )
    }
    // 新版分 P 列表在 .page-list, 旧版在 children[1]
    const pageList = item.querySelector('.page-list') ?? item.children[1]
    const lastPage = pageList?.lastElementChild
    return Boolean(
      lastPage?.classList.contains('active') ||
        lastPage?.classList.contains('multip-list-item-active'),
    )
  }

  checkPlayMode(rightPanel: Element) {
    const hasSequentialList = rightPanel.querySelector(
      '.base-video-sections, .base-video-sections-v1, .multi-page, .multi-page-v1, .multip, .video-pod__list.section',
    )
    const shouldContinue =
      hasSequentialList !== null && this.disableConditions.every(condition => !condition())
    playerAgent.setAutoPlayNextVideo(shouldContinue)
  }

  checkPlayListPlayMode(rightPanel: Element) {
    // spell-checker: disable
    const videoSequentialNumber = dq(rightPanel, '.list-count, .video-pod__header .amt')
    const lastVideoElement = dq(
      '.action-list .action-list-item-wrap:last-child .singlep-list-item-inner, .action-list .action-list-item-wrap:last-child .multip-list-item-inner, .video-pod__list .pod-item:last-child',
    )
    if (videoSequentialNumber === null || lastVideoElement === null) {
      this.checkPlayMode(rightPanel)
      return
    }
    const sequentialNumbers = videoSequentialNumber.innerHTML
      .replace(/[（）]/g, '')
      .split('/')
      .map(it => parseInt(it))
    const isLastVideo = this.isLastListItem(lastVideoElement)
    const shouldContinue = !(sequentialNumbers[0] >= sequentialNumbers[1] && isLastVideo)

    console.log('checkPlayListPlayMode', { isLastVideo, sequentialNumbers, shouldContinue })
    playerAgent.setAutoPlayNextVideo(shouldContinue)
    // spell-checker: enable
  }

  async setupAutoPlay() {
    this.onRightPanelLoaded(rightPanel => {
      const check = () =>
        mediaListUrls.some(url => matchUrlPattern(url))
          ? this.checkPlayListPlayMode(rightPanel)
          : this.checkPlayMode(rightPanel)
      childListSubtree(rightPanel, () => check())
      this.onVideoChange(check)
    })
  }
}

class BangumiLegacyAutoPlay extends LegacyAutoPlay {
  async setupAutoPlay() {
    // 等待 handoff API 就绪
    const ready = await sq(() =>
      Boolean(playerAgent.nativeApi?.getHandoff && playerAgent.nanoApi?.HandoffKind),
    )
    if (!ready) {
      const console = useScopedConsole('传统连播模式')
      console.warn('handoff API 未就绪')
      return
    }
    playerAgent.setAutoPlayNextVideo(true)
  }
}

export const component = defineComponentMetadata({
  name: 'legacyAutoPlay',
  displayName: '传统连播模式',
  tags: [componentsTags.video],
  urlInclude: [...videoUrls, ...bangumiUrls],
  entry: async () => {
    const isBangumi = bangumiUrls.some(url => matchUrlPattern(url))
    const legacyAutoPlay = isBangumi ? new BangumiLegacyAutoPlay() : new VideoLegacyAutoPlay()
    await legacyAutoPlay.setupAutoPlay()
  },
})

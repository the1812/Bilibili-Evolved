import { defineComponentMetadata } from '@/components/define'
import { playerAgent } from '@/components/video/player-agent'
import { childListSubtree, videoChange } from '@/core/observer'
import { select } from '@/core/spin-query'
import { getVue2Data, matchUrlPattern, playerReady } from '@/core/utils'
import { useScopedConsole } from '@/core/utils/log'
import { bangumiUrls, videoUrls } from '@/core/utils/urls'

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
  async onVideoChange(callback: (video: HTMLVideoElement) => Promise<void> | void) {
    videoChange(async () => {
      const video = (await playerAgent.query.video.element()) as HTMLVideoElement
      video?.addEventListener('play', () => callback(video), { once: true })
    })
  }
  abstract setupAutoPlay(): Promise<void>
}

class VideoLegacyAutoPlay extends LegacyAutoPlay {
  /** 最后 1P 时不能开启连播 */
  readonly disableConditions = [
    /** 传统分 P */
    () =>
      Boolean(
        dq(
          ':is(.multi-page, .multi-page-v1) .list-box li.on:last-child, .video-pod__list .simple-base-item.active:last-child',
        ),
      ),
    /** 替代分 P 的合集 & 可分子合集的分 P 合集, 布局长得比下面那个丑一点 */
    () =>
      Boolean(
        dq(
          '.video-sections-item:last-child .video-episode-card:last-child .video-episode-card__info-playing',
        ),
      ),
    /** 可分子合集的合集 */
    () =>
      Boolean(
        dq(
          '.video-sections-item:last-child .video-episode-card:last-child .video-episode-card__info-title-playing',
        ),
      ),
  ]

  checkPlayMode(rightPanel: Element) {
    const hasSequentialList = rightPanel.querySelector(
      '.base-video-sections, .base-video-sections-v1, .multi-page, .multi-page-v1, .multip',
    )
    const shouldContinue =
      hasSequentialList !== null && this.disableConditions.every(condition => !condition())
    playerAgent.setAutoPlayNextVideo(shouldContinue)
  }
  async checkPlayListPlayMode(rightPanel: Element) {
    // spell-checker: disable
    const videoSequentialNumber = dq(rightPanel, '.list-count, .video-pod__header .amt')
    const sequentialNumbers = videoSequentialNumber.innerHTML
      .replace(/[（）]/g, '')
      .split('/')
      .map(it => parseInt(it))
    const lastVideoElement = dq(
      '.action-list .action-list-item-wrap:last-child .action-list-item .actionlist-item-inner, .video-pod__list .pod-item:last-child',
    )

    const isSingleList =
      lastVideoElement.classList.contains('singlep-list-item-inner') ||
      lastVideoElement.querySelector('.single-p') !== null
    const isLastVideo = (() => {
      if (isSingleList) {
        return (
          lastVideoElement.classList.contains('siglep-active') ||
          lastVideoElement.querySelector('.simple-base-item.active') !== null
        )
      }
      return lastVideoElement.children[1].lastElementChild.classList.contains(
        'multip-list-item-active',
      )
    })()

    const shouldContinue = !(sequentialNumbers[0] >= sequentialNumbers[1] && isLastVideo)

    console.log('checkPlayListPlayMode', { isLastVideo, sequentialNumbers, shouldContinue })
    const app = document.getElementById('app')
    const vueInstance = getVue2Data(app)
    vueInstance.setContinuousPlay(shouldContinue)
    // spell-checker: enable
  }

  async setupAutoPlay() {
    this.onRightPanelLoaded(rightPanel => {
      const check = () => {
        const isPlayList = rightPanel.querySelector('.video-pod__list.section')
        return isPlayList ? this.checkPlayListPlayMode(rightPanel) : this.checkPlayMode(rightPanel)
      }
      childListSubtree(rightPanel, () => check())
      this.onVideoChange(() => check())
    })
  }
}

class BangumiLegacyAutoPlay extends LegacyAutoPlay {
  async setupAutoPlay() {
    const autoPlayRadio = (await select(
      '.bpx-player-ctrl-setting-handoff input[type="radio"][value="0"]',
    )) as HTMLInputElement
    if (autoPlayRadio === null) {
      const console = useScopedConsole('传统连播模式')
      console.warn('未找到 autoPlayRadio')
      return
    }
    autoPlayRadio.click()
  }
}

export const component = defineComponentMetadata({
  name: 'legacyAutoPlay',
  displayName: '传统连播模式',
  tags: [componentsTags.video],
  urlInclude: [...videoUrls, ...bangumiUrls],
  entry: async () => {
    const legacyAutoPlay = (() => {
      const isBangumi = bangumiUrls.some(url => matchUrlPattern(url))
      if (isBangumi) {
        return new BangumiLegacyAutoPlay()
      }
      return new VideoLegacyAutoPlay()
    })()
    await legacyAutoPlay.setupAutoPlay()
  },
})

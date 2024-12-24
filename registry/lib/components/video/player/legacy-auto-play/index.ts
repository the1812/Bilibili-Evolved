import { defineComponentMetadata } from '@/components/define'
import { getVueData } from '@/components/feeds/api'
import { playerAgent } from '@/components/video/player-agent'
import { childListSubtree, videoChange } from '@/core/observer'
import { select } from '@/core/spin-query'
import { matchUrlPattern, playerReady } from '@/core/utils'
import { useScopedConsole } from '@/core/utils/log'
import { bangumiUrls, videoUrls } from '@/core/utils/urls'

abstract class LegacyAutoPlay {
  isChecked(container: HTMLElement) {
    return (
      Boolean(container.querySelector('.switch-button.on') || container.matches(':checked')) ||
      container.classList.contains('on')
    )
  }
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
  readonly autoPlayControls = {
    /** 命中时应该打开连播: 传统分 P, 合集 */
    enable: [
      ':is(.base-video-sections, .base-video-sections-v1) .next-button',
      ':is(.multi-page, .multi-page-v1) .next-button',
      '.player-auxiliary-autoplay-switch input',
      '.video-pod .auto-play .switch-btn',
    ],
    /** 命中时应该关闭连播: 关联视频推荐 */
    disable: [
      ':is(.recommend-list, .recommend-list-v1) .next-button',
      '.recommend-list-v1 .switch-btn',
    ],
  }
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

  async checkPlayMode() {
    const element = (await select(
      [...this.autoPlayControls.disable, ...this.autoPlayControls.enable].join(','),
    )) as HTMLElement
    if (!element) {
      return
    }
    const shouldChecked =
      this.autoPlayControls.enable.some(selector => element.matches(selector)) &&
      this.disableConditions.every(condition => !condition())
    const checked = this.isChecked(element)
    console.log('checkPlayMode', { shouldChecked, checked })
    if (shouldChecked !== checked) {
      element.click()
    }
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
    const vueInstance = getVueData(app)
    // 不用判断当前状态是什么，直接将将是否需要继续播放赋值 vue 实例中的 continuousPlay
    vueInstance.setContinuousPlay(shouldContinue)
    // spell-checker: enable
  }

  async setupAutoPlay() {
    this.onRightPanelLoaded(rightPanel => {
      const check = () => {
        const isPlayList = rightPanel.querySelector('.video-pod__list.section')
        return isPlayList ? this.checkPlayListPlayMode(rightPanel) : this.checkPlayMode()
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
  description: '模拟传统的多 P 连播策略: 仅连播视频的分 P, 最后 1P 放完禁止连播其他推荐视频.',
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

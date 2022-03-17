import { ComponentMetadata } from '@/components/types'
import { videoChange } from '@/core/observer'
import { select } from '@/core/spin-query'
import { playerReady } from '@/core/utils'
import { videoUrls } from '@/core/utils/urls'

export const component: ComponentMetadata = {
  name: 'legacyAutoPlay',
  displayName: '传统连播模式',
  description: '模拟传统的多 P 连播策略: 仅连播视频的分 P, 最后 1P 放完禁止连播其他推荐视频.',
  tags: [componentsTags.video],
  urlInclude: videoUrls,
  entry: async () => {
    const autoPlayControls = {
      enable: [
        '.base-video-sections .next-button',
        '.multi-page .next-button',
        '.player-auxiliary-autoplay-switch input',
      ],
      disable: ['.recommend-list .next-button'],
    }
    // 最后 1P 时不能开启连播
    const disableConditions = [
      // 传统分 P
      () => Boolean(dq('.multi-page .list-box li.on:last-child')),
      // 替代分 P 的合集
      // & 可分子合集的分 P 合集, 布局长得比下面那个丑一点
      () => Boolean(dq('.video-sections-item:last-child .video-episode-card:last-child .video-episode-card__info-playing')),
      // 可分子合集的合集
      () => Boolean(dq('.video-sections-item:last-child .video-episode-card:last-child .video-episode-card__info-title-playing')),
    ]
    const isChecked = (container: HTMLElement) => Boolean(
      container.querySelector('.switch-button.on') || container.matches(':checked'),
    )
    await playerReady()
    const checkPlayMode = async () => {
      const element = await select(
        [...autoPlayControls.disable, ...autoPlayControls.enable].join(','),
      ) as HTMLElement
      if (!element) {
        return
      }
      const shouldChecked = autoPlayControls.enable.some(selector => element.matches(selector))
        && disableConditions.every(condition => !condition())
      const checked = isChecked(element)
      if (shouldChecked !== checked) {
        element.click()
      }
    }
    videoChange(async () => {
      checkPlayMode()
      const video = await select('.bilibili-player-video video') as HTMLVideoElement
      video?.addEventListener('play', checkPlayMode, { once: true })
    })
  },
}

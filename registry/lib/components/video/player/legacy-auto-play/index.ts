import { defineComponentMetadata } from '@/components/define'
import { playerAgent } from '@/components/video/player-agent'
import { childListSubtree, videoChange } from '@/core/observer'
import { select } from '@/core/spin-query'
import { playerReady } from '@/core/utils'
import { useScopedConsole } from '@/core/utils/log'
import { videoUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'legacyAutoPlay',
  displayName: '传统连播模式',
  description: '模拟传统的多 P 连播策略: 仅连播视频的分 P, 最后 1P 放完禁止连播其他推荐视频.',
  tags: [componentsTags.video],
  urlInclude: videoUrls,
  entry: async () => {
    const console = useScopedConsole('传统连播模式')
    const autoPlayControls = {
      // 命中时应该打开连播: 传统分 P, 合集
      enable: [
        ':is(.base-video-sections, .base-video-sections-v1) .next-button',
        ':is(.multi-page, .multi-page-v1) .next-button',
        '.player-auxiliary-autoplay-switch input',
      ],
      // 命中时应该关闭连播: 关联视频推荐
      disable: [':is(.recommend-list, .recommend-list-v1) .next-button'],
    }
    // 最后 1P 时不能开启连播
    const disableConditions = [
      // 传统分 P
      () => Boolean(dq(':is(.multi-page, .multi-page-v1) .list-box li.on:last-child')),
      // 替代分 P 的合集
      // & 可分子合集的分 P 合集, 布局长得比下面那个丑一点
      () =>
        Boolean(
          dq(
            '.video-sections-item:last-child .video-episode-card:last-child .video-episode-card__info-playing',
          ),
        ),
      // 可分子合集的合集
      () =>
        Boolean(
          dq(
            '.video-sections-item:last-child .video-episode-card:last-child .video-episode-card__info-title-playing',
          ),
        ),
    ]
    const isChecked = (container: HTMLElement) =>
      Boolean(container.querySelector('.switch-button.on') || container.matches(':checked'))
    await playerReady()
    const checkPlayMode = async () => {
      const element = (await select(
        [...autoPlayControls.disable, ...autoPlayControls.enable].join(','),
      )) as HTMLElement
      if (!element) {
        return
      }
      const shouldChecked =
        autoPlayControls.enable.some(selector => element.matches(selector)) &&
        disableConditions.every(condition => !condition())
      const checked = isChecked(element)
      if (shouldChecked !== checked) {
        element.click()
      }
    }
    videoChange(async () => {
      checkPlayMode()
      const video = (await playerAgent.query.video.element()) as HTMLVideoElement
      video?.addEventListener('play', checkPlayMode, { once: true })
    })
    const rightPanelContainer = await select('.right-container-inner')
    if (!rightPanelContainer) {
      console.warn('未找到 rightPanelContainer')
      return
    }
    childListSubtree(rightPanelContainer, () => checkPlayMode())
  },
})

import { ComponentMetadata } from '@/components/types'
import { videoChange } from '@/core/observer'
import { select } from '@/core/spin-query'
import { playerReady } from '@/core/utils'
import { videoUrls } from '@/core/utils/urls'

export const component: ComponentMetadata = {
  name: 'legacyAutoPlay',
  displayName: '传统连播模式',
  tags: [componentsTags.video],
  urlInclude: videoUrls,
  entry: async () => {
    const autoPlayControls = {
      enable: ['.multi-page .next-button', '.player-auxiliary-autoplay-switch input'],
      disable: ['.recommend-list .next-button'],
    }
    const disableConditions = [
      // 最后 1P 时不能开启连播
      () => Boolean(dq('.multi-page .list-box li.on:last-child')),
      // TODO: 合计列表如何确定是最后 1P?
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

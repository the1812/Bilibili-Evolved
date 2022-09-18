import { defineComponentMetadata } from '@/components/define'
import { styledComponentEntry } from '@/components/styled-component'
import { playerUrls } from '@/core/utils/urls'

export const SkipChargeListDisabledClass = 'skip-charge-list-disable'
const entry = styledComponentEntry(
  () => import('./charge-list.scss'),
  async () => {
    const { videoChange } = await import('@/core/observer')
    const { select } = await import('@/core/spin-query')

    videoChange(async () => {
      const video = await select('video')
      video?.addEventListener('ended', async () => {
        if (document.body.classList.contains(SkipChargeListDisabledClass)) {
          return
        }
        // 选择2.X或3.X的跳过按钮
        const jumpButton = (await select(
          '.bilibili-player-electric-panel-jump,.bpx-player-electric-jump',
        )) as HTMLElement
        jumpButton?.click()
      })
    })
  },
)
export const component = defineComponentMetadata({
  name: 'skipChargeList',
  displayName: '跳过充电鸣谢',
  tags: [componentsTags.video],
  entry,
  description: {
    'zh-CN': '自动跳过视频结尾的充电鸣谢. 注意: 不包括番剧承包鸣谢.',
  },
  reload: () => document.body.classList.remove(SkipChargeListDisabledClass),
  unload: () => document.body.classList.add(SkipChargeListDisabledClass),
  urlInclude: playerUrls,
})

import {
  defineOptionsMetadata,
  OptionsOfMetadata,
  defineComponentMetadata,
} from '@/components/define'
import { ComponentEntry } from '@/components/types'
import { allQualities } from '@/components/video/video-quality'
import { playerUrls } from '@/core/utils/urls'

const options = defineOptionsMetadata({
  quality: {
    displayName: '画质选择',
    defaultValue: '4K',
    dropdownEnum: allQualities.map(it => it.name),
  },
})

export type Options = OptionsOfMetadata<typeof options>

const entry: ComponentEntry<Options> = async ({ settings }) => {
  const { videoChange } = await import('@/core/observer')
  videoChange(async () => {
    const { select } = await import('@/core/spin-query')
    const { descendingSort } = await import('@/core/utils/sort')
    const selector = '.bilibili-player-video-quality-menu .bui-select-list>li.bui-select-item'
    await select(selector)
    const qualityItems = dqa(selector) as HTMLElement[]
    if (!qualityItems) {
      return
    }
    const [highestQualities] = qualityItems
      .map(it => parseInt(it.getAttribute('data-value')))
      .sort(descendingSort(i => i))
    const [targetQuality] = allQualities
      .filter(it => it.name === settings.options.quality)
      .map(it => it.value)
      .sort(descendingSort(i => i))
    const [finalQuality] = allQualities
      .map(it => it.value)
      .filter(it => it <= Math.min(targetQuality, highestQualities))
      .sort(descendingSort(i => i))
    const video = (await select('video')) as HTMLVideoElement
    const onplay = () => {
      qualityItems.forEach(it => {
        if (parseInt(it.getAttribute('data-value')) === finalQuality) {
          it.click()
        }
      })
      video.removeEventListener('play', onplay)
    }
    video.addEventListener('play', onplay)
  })
}
export const component = defineComponentMetadata({
  name: 'defaultVideoQuality',
  displayName: '默认视频画质',
  // 老功能了, b站早支持记住画质了
  hidden: true,
  tags: [componentsTags.video],
  entry,
  options,
  urlInclude: playerUrls,
})

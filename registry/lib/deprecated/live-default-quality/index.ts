import {
  defineOptionsMetadata,
  OptionsOfMetadata,
  defineComponentMetadata,
} from '@/components/define'
import { ComponentEntry } from '@/components/types'
import { delay } from '@/core/utils'
import { liveUrls } from '@/core/utils/urls'

export enum LiveQuality {
  Original = '原画',
  BlueRay = '蓝光',
  High = '超清',
  Medium = '高清',
  Low = '流畅',
}
const options = defineOptionsMetadata({
  quality: {
    displayName: '画质选择',
    defaultValue: LiveQuality.Original,
    dropdownEnum: LiveQuality,
  },
})

export type Options = OptionsOfMetadata<typeof options>

const entry: ComponentEntry<Options> = async ({ settings }) => {
  const { getDropdownItems } = await import('@/components/settings-panel/dropdown')
  const { dqa, dq } = await import('@/core/utils')
  const { select } = await import('@/core/spin-query')
  const { childList } = await import('@/core/observer')

  const qualities = getDropdownItems(LiveQuality) as LiveQuality[]
  const targetQuality = settings.options.quality

  const qualitySettings = (await select(
    '.bilibili-live-player-video-controller-switch-quality-btn',
  )) as HTMLElement
  if (qualitySettings === null) {
    return
  }
  const setQuality = async () => {
    const currentQuality = qualitySettings.children[0].getAttribute('data-title') as string
    const qualityButtons = dqa(
      qualitySettings,
      '.bilibili-live-player-video-controller-html-tooltip-option .text-btn',
    ) as HTMLElement[]
    const availableQualities = qualityButtons.map(it => it.getAttribute('data-title') as string)
    console.log(currentQuality, availableQualities, targetQuality)
    if (currentQuality !== targetQuality) {
      let quality = targetQuality
      // 支持的清晰度里没有设定好的那个清晰度, 就从设定的清晰度往下降
      while (!availableQualities.includes(quality)) {
        const index = qualities.indexOf(quality)
        // 已经是最低清晰度 / 不支持清晰度切换, 取消执行
        if (index >= qualities.length - 1) {
          return
        }
        quality = qualities[index + 1]
      }
      const button = qualityButtons[availableQualities.indexOf(quality)]
      console.log(button)
      while (
        !(
          button.classList.contains('active') ||
          dq('.bilibili-live-player-video-controller-switch-quality-info')
        )
      ) {
        await delay(3000)
        button.click()
        console.log('click')
      }
    }
  }
  childList(qualitySettings, () => {
    console.log(qualitySettings.childElementCount)
    if (qualitySettings.childElementCount > 0) {
      setQuality()
    }
  })
}
export const component = defineComponentMetadata({
  name: 'defaultLiveQuality',
  displayName: '默认直播画质',
  options,
  entry,
  tags: [componentsTags.live],
  urlInclude: liveUrls,
})

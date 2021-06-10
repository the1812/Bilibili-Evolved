import { ComponentMetadata, componentsTags } from '@/components/component'
import { ComponentSettings } from '@/core/settings'
import { liveUrls } from '../live-urls'

export enum LiveQuality {
  original = '原画',
  blueRay = '蓝光',
  high = '超清',
  medium = '高清',
  low = '流畅',
}
const entry = async (settings: ComponentSettings) => {
  const { getDropdownItems } = await import('@/components/settings-panel/dropdown')
  const { dqa, dq } = await import('@/core/utils')
  const { select } = await import('@/core/spin-query')
  const { childList } = await import('@/core/observer')

  const qualities = getDropdownItems(LiveQuality) as string[]
  const targetQuality = settings.options.quality

  const qualitySettings = await select('.bilibili-live-player-video-controller-switch-quality-btn') as HTMLElement
  if (qualitySettings === null) {
    return
  }
  const setQuality = async () => {
    const currentQuality = qualitySettings.children[0].getAttribute('data-title') as string
    const qualityButtons = dqa(qualitySettings, '.bilibili-live-player-video-controller-html-tooltip-option .text-btn') as HTMLElement[]
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
      while (!(button.classList.contains('active') || dq('.bilibili-live-player-video-controller-switch-quality-info'))) {
        await (() => new Promise(r => setTimeout(() => r(), 3000)))()
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
export const component: ComponentMetadata = {
  name: 'defaultLiveQuality',
  displayName: '默认直播画质',
  enabledByDefault: false,
  options: {
    quality: {
      displayName: '画质选择',
      defaultValue: LiveQuality.original,
      dropdownEnum: LiveQuality,
    },
  },
  entry,
  tags: [
    componentsTags.live,
  ],
  urlInclude: liveUrls,
}

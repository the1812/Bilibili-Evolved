import {
  OptionsOfMetadata,
  defineComponentMetadata,
  defineOptionsMetadata,
} from '@/components/define'
import { disableScrollVolume } from '../disable-scroll-volume'
import { playerAgent } from '@/components/video/player-agent'
import { getComponentSettings } from '@/core/settings'
import { allVideoUrls } from '@/core/utils/urls'

let cancel: () => void

const MaxDeltaFactor = 30
const options = defineOptionsMetadata({
  deltaFactor: {
    defaultValue: 15,
    slider: {
      min: 1,
      max: MaxDeltaFactor,
      step: 1,
    },
    displayName: '灵敏度',
  },
})
const invertScrollVolume = () => {
  cancel?.()
  const settings = getComponentSettings<OptionsOfMetadata<typeof options>>('invertScrollVolume')
  const handleWheel = (e: WheelEvent) => {
    const isFullscreen = [
      'player-mode-webfullscreen',
      'player-fullscreen-fix',
      'player-full-win',
    ].some(token => document.body.classList.contains(token))
    if (isFullscreen) {
      playerAgent.changeVolume(e.deltaY / ((MaxDeltaFactor - settings.options.deltaFactor + 1) / 2))
    }
  }
  unsafeWindow.addEventListener('wheel', handleWheel)
  const cancelPrevent = disableScrollVolume()
  return () => {
    unsafeWindow.removeEventListener('wheel', handleWheel)
    cancelPrevent()
  }
}
export const component = defineComponentMetadata({
  name: 'invertScrollVolume',
  displayName: '反转滚轮调音量',
  tags: [componentsTags.video],
  options,
  entry: () => {
    cancel?.()
    cancel = invertScrollVolume()
  },
  reload: () => {
    cancel?.()
    cancel = invertScrollVolume()
  },
  unload: () => cancel?.(),
  urlInclude: allVideoUrls,
})

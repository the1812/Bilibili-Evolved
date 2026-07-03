import { defineComponentMetadata } from '@/components/define'
import { playerUrls } from '@/core/utils/urls'
import { entry } from './entry'

export const component = defineComponentMetadata({
  name: 'touchPlayerGestures',
  displayName: '播放器触摸手势',
  enabledByDefault: navigator.maxTouchPoints > 0,
  tags: [componentsTags.touch],
  entry,
  urlInclude: playerUrls,
  options: {
    swiperDistance: {
      displayName: '手势触发最小距离',
      defaultValue: 10,
      hidden: true,
    },
  },
})

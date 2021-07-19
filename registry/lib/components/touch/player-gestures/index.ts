import { ComponentMetadata } from '@/components/types'
import { playerUrls } from '@/core/utils/urls'
import desc from './desc.md'
import { entry } from './entry'

export const component: ComponentMetadata = {
  name: 'touchPlayerGestures',
  displayName: '播放器触摸手势',
  enabledByDefault: navigator.maxTouchPoints > 0,
  tags: [
    componentsTags.touch,
  ],
  description: {
    'zh-CN': desc,
  },
  entry,
  urlInclude: playerUrls,
}

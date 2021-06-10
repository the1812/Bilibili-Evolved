import { ComponentMetadata, componentsTags } from '@/components/component'
import { playerUrls } from '@/components/video/player/player-urls'
import desc from './desc.md'
import { entry } from './entry'

export const component: ComponentMetadata = {
  name: 'touchPlayerGestures',
  displayName: '播放器触摸手势',
  enabledByDefault: false,
  tags: [
    componentsTags.touch,
  ],
  description: {
    'zh-CN': desc,
  },
  entry,
  urlInclude: playerUrls,
}

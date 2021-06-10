import { ComponentMetadata, componentsTags } from '@/components/component'
import { toggleStyle } from '@/components/styled-component'
import { playerUrls } from '@/components/video/player/player-urls'

export const component: ComponentMetadata = {
  name: 'playerShadow',
  displayName: '播放器投影',
  ...toggleStyle(() => import('./player-shadow.scss')),
  tags: [
    componentsTags.style,
  ],
  enabledByDefault: false,
  description: {
    'zh-CN': '为播放器添加主题色投影.',
  },
  urlInclude: playerUrls,
}

import { ComponentMetadata } from '@/components/types'
import { allVideoUrls } from '@/core/utils/urls'

export const component: ComponentMetadata = {
  name: 'playerShadow',
  displayName: '播放器投影',
  entry: none,
  instantStyles: [
    {
      name: 'playerShadow',
      style: () => import('./player-shadow.scss'),
    },
  ],
  tags: [
    componentsTags.style,
    componentsTags.video,
  ],
  description: {
    'zh-CN': '为播放器添加主题色投影.',
  },
  urlInclude: allVideoUrls,
}

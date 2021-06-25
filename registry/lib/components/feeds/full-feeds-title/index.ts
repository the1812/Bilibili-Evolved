import { toggleStyle } from '@/components/styled-component'
import { ComponentMetadata } from '@/components/types'

export const component: ComponentMetadata = {
  ...toggleStyle('fullFeedsTitle', () => import('./full-feeds-title.scss')),
  displayName: '展开动态标题',
  description: {
    'zh-CN': '在顶栏的视频动态中, 无论标题多长总是完全展开.',
  },
  tags: [componentsTags.feeds, componentsTags.style],
  enabledByDefault: false,
}

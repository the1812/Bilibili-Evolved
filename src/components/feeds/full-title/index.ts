import { ComponentMetadata, componentsTags } from '@/components/component'
import { toggleStyle } from '@/components/styled-component'

export const component: ComponentMetadata = {
  name: 'fullFeedsTitle',
  displayName: '展开动态标题',
  description: {
    'zh-CN': '在顶栏的动态预览框中, 总是展开完整的视频标题.',
  },
  ...toggleStyle(() => import('./full-title.scss')),
  enabledByDefault: false,
  tags: [
    componentsTags.style,
    componentsTags.feeds,
  ],
}

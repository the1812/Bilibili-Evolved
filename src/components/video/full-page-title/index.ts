import { ComponentMetadata, componentsTags } from '@/components/component'
import { toggleStyle } from '@/components/styled-component'

export const component: ComponentMetadata = {
  name: 'fullPageTitle',
  displayName: '展开选集标题',
  ...toggleStyle(() => import('./full-page-title.scss')),
  tags: [
    componentsTags.style,
    componentsTags.video,
  ],
  enabledByDefault: true,
  description: {
    'zh-CN': '在网页全屏时, 即使宽度过小在视频选集列表中, (选集多时)展开整个列表, 当标题超出一行时, 另起一行以显示完整标题.',
  },
  urlInclude: [
    '//www.bilibili.com/video/',
  ],
}

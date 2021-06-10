import { ComponentMetadata, componentsTags } from '@/components/component'
import { toggleStyle } from '@/components/styled-component'

export const component: ComponentMetadata = {
  name: 'hideBanner',
  displayName: '隐藏顶部横幅',
  ...toggleStyle(() => import('./banner.scss')),
  tags: [
    componentsTags.style,
  ],
  enabledByDefault: false,
  description: {
    'zh-CN': '隐藏首页顶部横幅.',
  },
  urlInclude: [
    '//www.bilibili.com',
  ],
}

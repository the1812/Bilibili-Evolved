import { ComponentMetadata, componentsTags } from '@/components/component'
import { toggleStyle } from '@/components/styled-component'

export const component: ComponentMetadata = {
  name: 'fullFeedsContent',
  displayName: '展开动态内容',
  description: {
    'zh-CN': '不管内容多长, 总是完全展开动态的内容.',
  },
  ...toggleStyle(() => import('./full-content.scss')),
  enabledByDefault: true,
  tags: [
    componentsTags.style,
    componentsTags.feeds,
  ],
  urlInclude: [
    '//t.bilibili.com/',
    '//live.bilibili.com/',
    '//space.bilibili.com/',
  ],
}

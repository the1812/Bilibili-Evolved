import { ComponentMetadata, componentsTags } from '@/components/component'
import { toggleStyle } from '@/components/styled-component'

export const component: ComponentMetadata = {
  name: 'hideCategory',
  displayName: '隐藏分区栏',
  ...toggleStyle(() => import('./category.scss')),
  tags: [
    componentsTags.style,
  ],
  enabledByDefault: false,
  description: {
    'zh-CN': '隐藏主站的分区栏, 分区仍然可以从顶栏的主站菜单中进入.',
  },
  urlInclude: [
    '//www.bilibili.com',
  ],
}

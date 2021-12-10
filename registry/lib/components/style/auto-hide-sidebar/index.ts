import { ComponentMetadata } from '@/components/types'

export const component: ComponentMetadata = {
  name: 'autoHideSidebar',
  entry: none,
  displayName: '自动隐藏侧栏',
  instantStyles: [
    {
      name: 'autoHideSidebar',
      style: () => import('./auto-hide-sidebar.scss'),
      important: true,
    },
  ],
  tags: [componentsTags.style, componentsTags.general],
  description: {
    'zh-CN': '自动隐藏脚本的侧栏 (功能和设置图标). 设置面板停靠在右侧时不建议使用, 因为网页的滚动条会占用右边缘的触发区域.',
  },
}

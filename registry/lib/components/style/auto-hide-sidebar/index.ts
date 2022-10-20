import { defineComponentMetadata } from '@/components/define'
import { addComponentListener } from '@/core/settings'
import { getNumberValidator } from '@/core/utils'

export const component = defineComponentMetadata({
  name: 'autoHideSidebar',
  entry: () => {
    addComponentListener(
      'autoHideSidebar.triggerWidth',
      (value: number) => {
        document.documentElement.style.setProperty('--auto-hide-sidebar-width', `${value}px`)
      },
      true,
    )
  },
  displayName: '自动隐藏侧栏',
  instantStyles: [
    {
      name: 'autoHideSidebar',
      style: () => import('./auto-hide-sidebar.scss'),
      important: true,
    },
  ],
  tags: [componentsTags.style, componentsTags.general],
  options: {
    triggerWidth: {
      defaultValue: 8,
      displayName: '触发区域宽度 (px)',
      validator: getNumberValidator(1, 1000),
    },
  },
  description: {
    'zh-CN':
      '自动隐藏脚本的侧栏 (功能和设置图标). 设置面板停靠在右侧时不建议使用, 因为网页的滚动条会占用右边缘的触发区域.',
  },
})

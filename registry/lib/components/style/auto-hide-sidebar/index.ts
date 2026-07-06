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
})

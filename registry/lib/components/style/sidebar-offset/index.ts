import { ComponentMetadata } from '@/components/types'
import { addComponentListener } from '@/core/settings'

export const component: ComponentMetadata = {
  name: 'sidebarOffset',
  displayName: '侧栏垂直偏移',
  tags: [componentsTags.style],
  instantStyles: [
    {
      name: 'sidebarOffset',
      style: () => import('./sidebar-offset.scss'),
    },
  ],
  description: {
    'zh-CN': '给脚本的侧栏设置垂直偏移量, 范围为 -40% ~ 40%',
  },
  entry: ({ metadata }) => {
    addComponentListener(`${metadata.name}.offset`, (value: number) => {
      document.body.style.setProperty('--be-sidebar-offset', `${value}%`)
    }, true)
  },
  options: {
    offset: {
      displayName: '偏移量 (%)',
      defaultValue: 0,
      validator: (value: number) => {
        if (value > 40) {
          return 40
        }
        if (value < -40) {
          return -40
        }
        return value
      },
    },
  },
}

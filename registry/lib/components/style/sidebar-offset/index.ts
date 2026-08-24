import { defineComponentMetadata } from '@/components/define'
import { addComponentListener } from '@/core/settings'
import { getNumberValidator } from '@/core/utils'

export const component = defineComponentMetadata({
  name: 'sidebarOffset',
  displayName: '侧栏垂直偏移',
  tags: [componentsTags.style],
  instantStyles: [
    {
      name: 'sidebarOffset',
      style: () => import('./sidebar-offset.scss'),
    },
  ],
  entry: ({ metadata }) => {
    addComponentListener(
      `${metadata.name}.offset`,
      (value: number) => {
        document.documentElement.style.setProperty('--be-sidebar-offset', `${value}%`)
      },
      true,
    )
  },
  options: {
    offset: {
      displayName: '偏移量 (%)',
      defaultValue: 0,
      validator: getNumberValidator(-35, 40),
    },
  },
})

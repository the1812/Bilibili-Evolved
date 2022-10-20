import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  name: 'v1PanelStyle',
  displayName: 'v1 风格设置面板',
  tags: [componentsTags.style],
  entry: none,
  description: {
    'zh-CN': '使用 v1 风格的设置面板样式',
  },
  instantStyles: [
    {
      name: 'v1PanelStyle',
      style: () => import('./v1-panel.scss'),
    },
  ],
})

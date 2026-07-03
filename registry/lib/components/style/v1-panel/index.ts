import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  name: 'v1PanelStyle',
  displayName: 'v1 风格设置面板',
  tags: [componentsTags.style],
  entry: none,
  instantStyles: [
    {
      name: 'v1PanelStyle',
      style: () => import('./v1-panel.scss'),
    },
  ],
})

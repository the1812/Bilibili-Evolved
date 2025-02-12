import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  name: 'hideTopicPanel',
  displayName: '隐藏话题面板',
  tags: [componentsTags.style],
  instantStyles: [
    {
      name: 'hideTopicPanel',
      style: () => import('./hide-topic-panel.scss'),
    },
  ],
  entry: async () => {
    // pass lint
  },
})

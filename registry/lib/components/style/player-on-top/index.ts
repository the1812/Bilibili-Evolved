import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  name: 'playerOnTop',
  displayName: '播放器置顶',
  instantStyles: [
    {
      name: 'playerOnTop',
      style: () => import('./player-on-top.scss'),
    },
  ],
  tags: [componentsTags.style, componentsTags.video],
  entry: none,
})

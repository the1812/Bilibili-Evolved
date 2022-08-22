import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  name: 'playerOnTop',
  displayName: '播放器置顶',
  description: {
    'zh-CN': '在视频页面中将播放器放在页面最上方.',
  },
  instantStyles: [
    {
      name: 'playerOnTop',
      style: () => import('./player-on-top.scss'),
    },
  ],
  tags: [componentsTags.style, componentsTags.video],
  entry: none,
})

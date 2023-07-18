import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  name: 'hideVideoShare',
  displayName: '隐藏视频分享',
  tags: [componentsTags.style, componentsTags.video],
  instantStyles: [
    {
      name: 'hideVideoShare',
      style: () => import('./hide-video-share.scss'),
    },
  ],
  entry: none,
})

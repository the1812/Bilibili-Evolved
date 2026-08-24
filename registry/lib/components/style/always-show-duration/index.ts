import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  name: 'alwaysShowDuration',
  displayName: '总是显示视频时长',
  tags: [componentsTags.video, componentsTags.style],
  instantStyles: [
    {
      name: 'alwaysShowDuration',
      style: () => import('./always-show-duration.scss'),
    },
  ],
  entry: none,
})

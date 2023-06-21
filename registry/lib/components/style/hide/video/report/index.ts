import { defineComponentMetadata } from '@/components/define'

const name = 'hideVideoReport'
export const component = defineComponentMetadata({
  name,
  displayName: '隐藏稿件投诉',
  tags: [componentsTags.video, componentsTags.style],
  entry: none,
  instantStyles: [
    {
      name,
      style: () => import('./hide-video-report.scss'),
    },
  ],
})

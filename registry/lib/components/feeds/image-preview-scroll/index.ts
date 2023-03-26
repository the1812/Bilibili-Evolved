import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  name: 'imagePreviewScroll',
  displayName: '动态图片限高',
  tags: [componentsTags.feeds],
  instantStyles: [
    {
      name: 'imagePreviewScroll',
      style: () => import('./image-preview-scroll.scss'),
    },
  ],
  entry: none,
})

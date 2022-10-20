import { defineComponentMetadata } from '@/components/define'

const name = 'hideFeedsCommentPreview'
export const component = defineComponentMetadata({
  name,
  tags: [componentsTags.feeds, componentsTags.style],
  displayName: '隐藏动态评论预览',
  entry: none,
  instantStyles: [
    {
      style: () => import('./hide-comment-preview.scss'),
      name,
    },
  ],
})

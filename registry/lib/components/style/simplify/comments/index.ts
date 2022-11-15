import { defineComponentMetadata } from '@/components/define'

const name = 'simplifyComments'
export const component = defineComponentMetadata({
  name,
  entry: async ({ metadata }) => {
    const { addComponentListener } = await import('@/core/settings')
    addComponentListener(
      metadata.name,
      (value: boolean) => {
        document.body.classList.toggle('simplify-comment', value)
      },
      true,
    )
  },
  instantStyles: [
    {
      name,
      style: () => import('./comments.scss'),
    },
    {
      name,
      style: () => import('./comments-v2.scss'),
    },
  ],
  displayName: '简化评论区',
  tags: [componentsTags.style],
})

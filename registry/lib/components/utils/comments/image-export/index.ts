import { defineComponentMetadata } from '@/components/define'
import { CommentItem, CommentReplyItem } from '@/components/utils/comment-apis'
import { addCommentImage, addNavButton } from './panel'

const entry = async () => {
  const { forEachCommentItem, forEachCommentArea, addMenuItem } = await import(
    '@/components/utils/comment-apis'
  )

  forEachCommentArea(area => {
    addNavButton(area.element)
  })

  const addExportButton = (comment: CommentItem) => {
    addCommentImage(comment)

    const processItems = (items: CommentReplyItem[]) => {
      items.forEach(item => {
        if (!(item instanceof CommentItem) || !item.pictures?.length) {
          return
        }
        addMenuItem(item, {
          className: 'image-export',
          text: '导出图片',
          action: () =>
            import('./panel').then(({ downloadSingleComment, commentImageStore }) => {
              const data = commentImageStore.get(item.id)
              if (data) {
                downloadSingleComment(data)
              }
            }),
        })
      })
    }
    processItems([comment, ...comment.replies])
    comment.addEventListener('repliesUpdate', e => processItems(e.detail))
  }

  forEachCommentItem({
    added: addExportButton,
  })
}

export const component = defineComponentMetadata({
  name: 'commentImageExport',
  displayName: '评论图片导出',
  author: {
    name: 'kaixinol',
    link: 'https://github.com/kaixinol',
  },
  entry,
  tags: [componentsTags.utils],
})

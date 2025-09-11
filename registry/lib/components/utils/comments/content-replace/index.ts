import { defineComponentMetadata } from '@/components/define'
import { CommentReplyItem, forEachCommentItem } from '@/components/utils/comment-apis'
import { sq } from '@/core/spin-query'
import { getData } from '@/plugins/data'
import type { CommentContentReplaceHandler } from './handlers/types'
import { commentContentReplaceOptions } from './options'

export const component = defineComponentMetadata({
  name: 'commentContentReplace',
  displayName: '评论内容替换',
  tags: [componentsTags.utils],
  options: commentContentReplaceOptions,
  entry: async () => {
    forEachCommentItem({
      added: async commentItem => {
        const { CommentContentReplaceHandlers } = await import('./handlers')
        const replaceContent = async (item: CommentReplyItem) => {
          if (item.shadowDomEntry === undefined) {
            return
          }
          const content = await sq(
            () => item.shadowDomEntry.querySelector(':host(bili-rich-text) #contents'),
            contents => contents.childNodes.length > 0,
            { queryInterval: 100 },
          )
          if (content === null) {
            return
          }
          const [handlers] = getData(CommentContentReplaceHandlers) as [
            CommentContentReplaceHandler[],
          ]
          handlers.forEach(h => h({ commentItem: item, content: Array.from(content.childNodes) }))
        }
        await replaceContent(commentItem)
        commentItem.replies.forEach(reply => {
          replaceContent(reply)
        })
        commentItem.addEventListener('repliesUpdate', e => {
          const replies = (e as CustomEvent).detail as CommentReplyItem[]
          replies.forEach(reply => {
            replaceContent(reply)
          })
        })
      },
    })
  },
  extraOptions: () => import('./settings/ExtraOptions.vue'),
})

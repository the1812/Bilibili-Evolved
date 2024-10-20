import { defineComponentMetadata } from '@/components/define'
import { forEachCommentItem } from '@/components/utils/comment-apis'
import { select } from '@/core/spin-query'
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
        if (commentItem.shadowDomEntry === undefined) {
          return
        }
        const content = await select(
          () => commentItem.shadowDomEntry.querySelector(':host(bili-rich-text) #contents'),
          { queryInterval: 200 },
        )
        if (content === null) {
          return
        }
        content.childNodes
        const [handlers] = getData(CommentContentReplaceHandlers) as [
          CommentContentReplaceHandler[],
        ]
        handlers.forEach(h => h({ commentItem, content: Array.from(content.childNodes) }))
      },
    })
  },
  extraOptions: () => import('./settings/ExtraOptions.vue'),
})

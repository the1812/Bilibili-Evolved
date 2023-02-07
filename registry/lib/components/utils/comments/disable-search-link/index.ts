import { defineComponentMetadata } from '@/components/define'
import { forEachCommentArea } from '@/components/utils/comment-apis'
import { preventEvent } from '@/core/utils'

const name = 'disableCommentsSearchLink'
let prevent = false
export const component = defineComponentMetadata({
  name,
  displayName: '禁用评论区搜索词',
  instantStyles: [
    {
      name,
      style: () => import('./disable-search-link.scss'),
      important: true,
    },
  ],
  tags: [componentsTags.utils, componentsTags.style],
  entry: async () => {
    prevent = true
    forEachCommentArea(area => {
      preventEvent(area.element, 'click', e => {
        if (!(e.target instanceof HTMLElement) || !prevent) {
          return false
        }
        const element = e.target as HTMLElement
        if (
          ['.jump-link.search-word', '.icon.search-word'].some(selector =>
            element.matches(selector),
          )
        ) {
          return true
        }
        return false
      })
    })
  },
  reload: () => {
    prevent = true
  },
  unload: () => {
    prevent = false
  },
})

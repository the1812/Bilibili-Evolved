import { defineComponentMetadata } from '@/components/define'
import { forEachCommentArea, CommentAreaV3 } from '@/components/utils/comment-apis'
import { ShadowRootEvents } from '@/core/shadow-root'
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
    {
      name,
      style: () => import('./disable-search-link-shadow.scss'),
      shadowDom: true,
    },
  ],
  tags: [componentsTags.utils, componentsTags.style],
  entry: async () => {
    prevent = true
    forEachCommentArea(async area => {
      const isV3Area = area instanceof CommentAreaV3
      if (isV3Area) {
        area.commentAreaEntry.addEventListener(
          ShadowRootEvents.Updated,
          (e: CustomEvent<MutationRecord[]>) => {
            const records = e.detail
            records.forEach(record => {
              record.addedNodes.forEach(node => {
                const isCommentLink =
                  node instanceof HTMLAnchorElement && node.getAttribute('data-type') === 'search'
                if (!isCommentLink) {
                  return
                }
                node.removeAttribute('href')
                node.removeAttribute('target')
              })
            })
          },
        )
      } else {
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
      }
    })
  },
  reload: () => {
    prevent = true
  },
  unload: () => {
    prevent = false
  },
})

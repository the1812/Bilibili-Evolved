import { defineComponentMetadata } from '@/components/define'
import { CommentItem, CommentReplyItem } from '@/components/utils/comment-apis'
import { matchUrlPattern } from '@/core/utils'
import { feedsUrls } from '@/core/utils/urls'

const entry = async () => {
  const { forEachCommentItem, addMenuItem } = await import('@/components/utils/comment-apis')

  const findParentFeedsUrl = (commentElement: HTMLElement) => {
    if (document.URL.match(/\/\/t\.bilibili\.com\/(\d+)/)) {
      return ''
    }
    if (feedsUrls.every(url => !matchUrlPattern(url))) {
      return ''
    }
    let element: HTMLElement | null = commentElement
    while (element !== null && element !== document.body) {
      if (element.hasAttribute('data-did')) {
        return `https://t.bilibili.com/${element.getAttribute('data-did')}`
      }
      element = element.parentElement
    }
    return ''
  }
  const addCopyLinkButton = (comment: CommentItem) => {
    const processItems = (items: CommentReplyItem[]) => {
      items.forEach(item => {
        addMenuItem(item, {
          className: 'copy-link',
          text: '复制链接',
          action: async () => {
            const url = findParentFeedsUrl(item.element) || document.URL.replace(location.hash, '')
            await navigator.clipboard.writeText(`${url}#reply${item.id}`)
          },
        })
      })
    }
    processItems([comment, ...comment.replies])
    comment.addEventListener('repliesUpdate', e => processItems(e.detail))
  }
  forEachCommentItem({
    added: addCopyLinkButton,
  })
}
export const component = defineComponentMetadata({
  name: 'copyCommentsLink',
  displayName: '复制评论链接',
  description: {
    'zh-CN': '开启后, 可在每条评论的菜单中选择复制链接.',
  },
  entry,
  tags: [componentsTags.utils],
})

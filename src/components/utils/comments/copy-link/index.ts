import { ComponentMetadata, componentsTags } from '@/components/component'
import { CommentItem } from '../api'

const entry = async () => {
  const { forEachCommentItem } = await import('../api')
  const { dq, matchUrlPattern } = await import('@/core/utils')
  const { feedsUrls } = await import('@/components/feeds/feeds-urls')

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
    [comment, ...comment.replies].forEach(item => {
      const operationList = dq(item.element, '.opera-list ul') as HTMLUListElement
      if (!operationList || dq(operationList, '.copy-link')) {
        return
      }
      const copyLinkButton = document.createElement('li')
      copyLinkButton.classList.add('copy-link')
      copyLinkButton.textContent = '复制链接'
      copyLinkButton.addEventListener('click', () => {
        const url = findParentFeedsUrl(item.element) || document.URL
        GM_setClipboard(`${url}#reply${item.id}`, { mimetype: 'text/plain' })
      })
      operationList.appendChild(copyLinkButton)
    })
  }
  forEachCommentItem({
    added: addCopyLinkButton,
  })
}
export const component: ComponentMetadata = {
  name: 'copyCommentsLink',
  displayName: '复制评论链接',
  description: {
    'zh-CN': '开启后, 可在每条评论的菜单中选择复制链接.',
  },
  entry,
  tags: [
    componentsTags.utils,
  ],
  enabledByDefault: false,
}

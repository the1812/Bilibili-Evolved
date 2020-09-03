import { CommentItem } from '../comment-apis'

(async () => {
  const { forEachCommentItem } = await import('../comment-apis')

  const feedsUrls = [
    'https://t.bilibili.com',
    'https://space.bilibili.com',
    'https://live.bilibli.com',
  ]
  const findParentFeedsUrl = (commentElement: HTMLElement) => {
    if (document.URL.match(/\/\/t\.bilibili\.com\/(\d+)/)) {
      return ''
    }
    if (feedsUrls.every(url => !document.URL.includes(url))) {
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
    const processItems = (items: Omit<CommentItem, 'replies'>[]) => {
      items.forEach(item => {
        const operationList = dq(item.element, '.opera-list ul') as HTMLUListElement
        if (!operationList || dq(operationList, '.copy-link')) {
          return
        }
        const copyLinkButton = document.createElement('li')
        copyLinkButton.classList.add('copy-link')
        copyLinkButton.textContent = '复制链接'
        copyLinkButton.addEventListener('click', () => {
          const url = findParentFeedsUrl(item.element) || document.URL.replace(/#.+$/, '')
          GM_setClipboard(`${url}#reply${item.id}`, { mimetype: 'text/plain' })
          console.log('[Copy Comment Link]',`${url}#reply${item.id}`)
        })
        operationList.appendChild(copyLinkButton)
      })
    }
    processItems([comment, ...comment.replies])
    comment.onRepliesUpdate = replies => processItems(replies)
  }
  forEachCommentItem({
    added: addCopyLinkButton
  })
})()

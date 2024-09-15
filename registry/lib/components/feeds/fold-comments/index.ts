import { defineComponentMetadata } from '@/components/define'
import { styledComponentEntry } from '@/components/styled-component'
import { feedsUrlsWithoutDetail } from '@/core/utils/urls'
import { feedsCardsManager } from '@/components/feeds/api'
import { select } from '@/core/spin-query'
import { childListSubtree } from '@/core/observer'

const entry = async () => {
  const { shadowRootStyles } = await import('@/core/shadow-root')
  const { forEachFeedsCard } = await import('@/components/feeds/api')
  const { childList } = await import('@/core/observer')
  const commentSelector = '.bb-comment, .bili-comment-container'
  const injectButton = (card: HTMLElement) => {
    const injectToComment = async (panelArea: HTMLElement, clickHandler: () => void) => {
      const commentBox = await select(() => dq(panelArea, commentSelector))
      if (commentBox.querySelector('.fold-comment') !== null) {
        return
      }
      if (commentBox === null) {
        console.error('未找到评论区')
        return
      }
      const button = document.createElement('div')
      button.classList.add('fold-comment')
      button.innerHTML = '收起评论'
      button.addEventListener('click', () => {
        clickHandler()
        card.scrollIntoView()
        window.scrollBy({ top: -75 })
      })
      commentBox.insertAdjacentElement('beforeend', button)
    }
    if (feedsCardsManager.managerType === 'v2') {
      const getExistingComment = () => dq(card, commentSelector) as HTMLElement
      const isCommentAreaReady = () => getExistingComment() !== null
      const handler = () => {
        const button = dq(card, '.bili-dyn-action.comment') as HTMLElement
        button?.click()
      }
      if (!isCommentAreaReady()) {
        childListSubtree(card, () => {
          if (isCommentAreaReady()) {
            injectToComment(card, handler)
          }
        })
      } else {
        injectToComment(getExistingComment(), handler)
      }
      return
    }
    if (feedsCardsManager.managerType === 'v1') {
      const panelArea = card.querySelector('.panel-area') as HTMLElement
      if (panelArea === null) {
        console.warn('panelArea not found', card)
        return
      }
      const handler = () => {
        const buttonBar = card.querySelector('.button-bar')
        const originalButton = buttonBar.children[1] as HTMLElement
        originalButton?.click()
      }
      if (panelArea.childElementCount === 0) {
        const [observer] = childList(panelArea, records => {
          if (records.length > 0) {
            injectToComment(panelArea, handler)
            observer.disconnect()
          }
        })
      } else {
        injectToComment(panelArea, handler)
      }
      return
    }
    console.warn('unrecognized card type', card)
  }
  forEachFeedsCard({
    added: c => injectButton(c.element),
  })

  const style = await import('./fold-comment-shadow.scss').then(m => m.default)
  shadowRootStyles.addStyle({
    id: 'foldComments',
    style,
  })
}

export const component = defineComponentMetadata({
  name: 'foldComments',
  displayName: '快速收起评论',
  description: {
    'zh-CN': '动态里查看评论区时, 在底部添加一个`收起评论`按钮, 这样就不用再回到上面收起了.',
  },
  urlInclude: feedsUrlsWithoutDetail,
  tags: [componentsTags.feeds],
  entry: styledComponentEntry(() => import('./fold-comment.scss'), entry),
})

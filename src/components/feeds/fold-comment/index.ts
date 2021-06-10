import { ComponentMetadata, componentsTags } from '@/components/component'
import { styledComponentEntry } from '@/components/styled-component'
import { feedsUrlsWithoutDetail } from '../feeds-urls'

const entry = async () => {
  const { forEachFeedsCard } = await import('../api')
  const { childList } = await import('@/core/observer')
  const injectButton = (card: HTMLElement) => {
    const injectToComment = (panelArea: HTMLDivElement) => {
      const button = document.createElement('div')
      button.classList.add('fold-comment')
      button.innerHTML = '收起评论'
      const commentBox = panelArea.querySelector('.bb-comment')
      if (commentBox.querySelector('.fold-comment') !== null) {
        return
      }
      if (commentBox === null) {
        console.error('未找到评论区')
        return
      }
      button.addEventListener('click', () => {
        const buttonBar = card.querySelector('.button-bar') as HTMLDivElement
        const originalButton = buttonBar.children[1] as HTMLDivElement
        if (originalButton !== null) {
          originalButton.click()
          card.scrollIntoView()
        }
      })
      commentBox.insertAdjacentElement('beforeend', button)
    }
    const panelArea = card.querySelector('.panel-area') as HTMLDivElement
    if (panelArea === null) {
      console.log(card)
    }
    if (panelArea.childElementCount === 0) {
      const [observer] = childList(panelArea, records => {
        if (records.length > 0) {
          injectToComment(panelArea)
          observer.disconnect()
        }
      })
    } else {
      injectToComment(panelArea)
    }
  }
  forEachFeedsCard({
    added: c => injectButton(c.element),
  })
}

export const component: ComponentMetadata = {
  name: 'foldComment',
  displayName: '快速收起评论',
  description: {
    'zh-CN': '动态里查看评论区时, 在底部添加一个<span>收起评论</span>按钮, 这样就不用再回到上面收起了.',
  },
  enabledByDefault: true,
  urlInclude: feedsUrlsWithoutDetail,
  tags: [
    componentsTags.feeds,
  ],
  entry: styledComponentEntry(() => import('./fold-comment.scss'), entry),
}

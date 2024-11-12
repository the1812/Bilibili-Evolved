import { defineComponentMetadata } from '@/components/define'
import { FeedsCard, feedsCardTypes } from '@/components/feeds/api'
import { feedsUrls } from '@/core/utils/urls'

let enabled = true
const id = 'disable-feeds-details-style'
const addStyle = async () => {
  const { addImportantStyle } = await import('@/core/style')
  const { default: style } = await import('./disable-details.scss')
  addImportantStyle(style, id)
}
const entry = async () => {
  const { addImportantStyle } = await import('@/core/style')
  const { forEachFeedsCard } = await import('@/components/feeds/api')
  const { default: initStyle } = await import('./init.scss')

  addImportantStyle(initStyle, 'disable-feeds-details-init-style')
  addStyle()
  const disableDetails = (card: FeedsCard) => {
    const { element } = card
    element.addEventListener(
      'click',
      e => {
        if (e.ctrlKey || !enabled) {
          return
        }
        const contents = dqa(
          element,
          '.content, .bili-dyn-content [data-module="desc"] .bili-rich-text, .dyn-card-opus__summary',
        )
        const target = e.target as HTMLElement
        if (target.hasAttribute('click-title')) {
          return
        }
        if (target.hasAttribute('data-pics')) {
          return
        }
        if (
          [
            'bili-rich-text__action',
            'bili-rich-text-topic',
            'bili-rich-text-module',
            'bili-rich-text-link',
            'bili-rich-text-viewpic',
          ].some(className => target.classList.contains(className))
        ) {
          return
        }
        const popups = dqa(element, '.im-popup')
        if (popups.some(p => p.contains(target))) {
          return
        }
        if (contents.some(c => c === target || c.contains(target))) {
          e.stopImmediatePropagation()
        }
      },
      { capture: true },
    )
    const postContent = dq(element, '.post-content, .bili-dyn-content')
    if (!postContent) {
      return
    }
    const hasCardContainer = [
      '.video-container',
      '.bangumi-container',
      '.media-list',
      '.article-container',
    ].some(type => dq(postContent, type))
    if (hasCardContainer) {
      return
    }
    if (dq(postContent, '.details')) {
      return
    }
    if (postContent.classList.contains('repost') || card.type === feedsCardTypes.repost) {
      const contents = dq(
        postContent,
        '.content, .bili-dyn-content__orig__desc, .dyn-card-opus__summary',
      ) as HTMLElement
      if (!contents) {
        return
      }
      const details = document.createElement('div')
      details.classList.add('details')
      details.setAttribute('click-title', '详情')
      details.innerHTML = /* html */ `
        详情<i class="mdi mdi-chevron-right" click-title></i>
      `
      contents.insertAdjacentElement('beforeend', details)
    }
  }
  forEachFeedsCard({
    added: disableDetails,
  })
}
export const component = defineComponentMetadata({
  name: 'disableFeedsDetails',
  displayName: '禁止跳转动态详情',
  tags: [componentsTags.feeds],
  urlInclude: feedsUrls,
  description: {
    'zh-CN': '禁止动态点击后跳转详情页, 方便选择其中的文字.',
  },
  entry,
  unload: () => {
    document.getElementById(id)?.remove()
    enabled = false
  },
  reload: () => {
    addStyle()
    enabled = true
  },
})

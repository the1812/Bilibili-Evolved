import { ComponentMetadata } from '@/components/component'
import { FeedsCard } from '@/components/feeds/api'
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
    element.addEventListener('click', e => {
      if (e.ctrlKey || !enabled) {
        return
      }
      const contents = dqa(element, '.content')
      const target = e.target as HTMLElement
      if (target.hasAttribute('click-title')) {
        return
      }
      if (contents.some(c => c === target || c.contains(target))) {
        e.stopImmediatePropagation()
      }
    }, { capture: true })
    const postContent = dq(element, '.post-content')
    if (!postContent) {
      return
    }
    if (dq(postContent, '.video-container') || dq(postContent, '.bangumi-container')) {
      return
    }
    if (dq(postContent, '.details')) {
      return
    }
    if (postContent.classList.contains('repost')) {
      const contents = dq(postContent, '.content') as HTMLElement
      if (!contents) {
        return
      }
      const details = document.createElement('div')
      details.classList.add('details')
      details.setAttribute('click-title', '详情')
      details.innerHTML = /* html */`
        详情<i class="mdi mdi-chevron-right" click-title></i>
      `
      contents.insertAdjacentElement('beforeend', details)
    }
  }
  forEachFeedsCard({
    added: disableDetails,
  })
}
export const component: ComponentMetadata = {
  name: 'disableFeedsDetails',
  displayName: '禁止跳转动态详情',
  tags: [
    componentsTags.feeds,
  ],
  enabledByDefault: true,
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
}

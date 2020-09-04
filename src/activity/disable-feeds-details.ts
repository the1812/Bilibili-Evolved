import { FeedsCard } from './feeds-apis'

let enabled = true
const id = 'disable-feeds-details-style'
const style = `
.card[data-did] .content { cursor: text }
.card[data-did] .content .details {
  font-size: 12px;
  opacity: 0.6;
  cursor: pointer;
  display: block;
}
`
resources.applyImportantStyleFromText(
  '.card[data-did] .content .details { display: none }',
  'disable-feeds-details-init-style'
)
const addStyle = () => resources.applyImportantStyleFromText(style, id)
const url = document.URL.replace(location.search, '')
const enable = url.startsWith('https://t.bilibili.com/') ||
  url.startsWith('https://space.bilibili.com/')

;(async () => {
  if (!enable) {
    return
  }
  addStyle()
  const { forEachFeedsCard } = await import('./feeds-apis')

  const disableDetails = (card: FeedsCard) => {
    const element = card.element
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
      details.innerHTML = /*html*/`
        详情<i class="mdi mdi-chevron-right" click-title></i>
      `
      contents.insertAdjacentElement('beforeend', details)
    }
  }
  forEachFeedsCard({
    added: disableDetails
  })
})()

export default {
  reload: () => {
    if (enable) {
      addStyle()
      enabled = true
    }
  },
  unload: () => {
    if (enable) {
      const style = document.getElementById(id)
      style && style.remove()
      enabled = false
    }
  }
}
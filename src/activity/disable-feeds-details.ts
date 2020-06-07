import { FeedsCard } from './feeds-apis'

let enabled = true
const id = 'disable-feeds-details-style'
const addStyle = () => resources.applyImportantStyleFromText('.feed-card .card .content { cursor: text }', id)
const url = document.URL.replace(location.search, '')
const enable = url === 'https://t.bilibili.com/' ||
  url.startsWith('https://space.bilibili.com/')

;(async () => {
  if (!enable) {
    return
  }
  addStyle()
  const { feedsCardsManager } = await import('./feeds-apis')
  const success = await feedsCardsManager.startWatching()
  if (!success) {
    console.error('feedsCardsManager.startWatching() failed')
    return
  }

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
  }
  feedsCardsManager.cards.forEach(disableDetails)
  feedsCardsManager.addEventListener('addCard', e => {
    const card = e.detail
    disableDetails(card)
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
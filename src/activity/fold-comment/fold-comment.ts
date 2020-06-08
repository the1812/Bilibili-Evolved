(async () => {
  if (document.URL.replace(window.location.search, '') !== 'https://t.bilibili.com/'
   && !document.URL.startsWith('https://space.bilibili.com')) {
     return
  }
  const { feedsCardsManager } = await import('../feeds-apis')
  const success = await feedsCardsManager.startWatching()
  if (!success) {
    console.error('feedsCardsManager.startWatching() failed')
    return
  }
  resources.applyImportantStyle('foldCommentStyle')
  const injectButton = (card: HTMLElement) => {
    const injectToComment = (panelArea: HTMLDivElement) => {
      const button = document.createElement('div')
      button.classList.add('fold-comment')
      button.innerHTML = '收起评论'
      const commentBox = panelArea.querySelector('.bb-comment')
      if (commentBox === null) {
        console.error('未找到评论区')
        return
      } else if (commentBox.querySelector('.fold-comment') !== null) {
        return
      } else {
        button.addEventListener('click', () => {
          const originalButton = card.querySelector('.button-bar')!.children[1] as HTMLDivElement
          if (originalButton !== null) {
            originalButton.click()
            card.scrollIntoView()
          }
        })
        commentBox.insertAdjacentElement('beforeend', button)
      }
    }
    const panelArea = card.querySelector('.panel-area') as HTMLDivElement
    if (panelArea === null) {
      console.log(card)
    }
    if (panelArea.childElementCount === 0) {
      const observers = Observer.childList(panelArea, records => {
        if (records.length > 0) {
          injectToComment(panelArea)
          observers.forEach(it => it.stop())
        }
      })
    } else {
      injectToComment(panelArea)
    }
  }
  feedsCardsManager.cards.forEach(c => injectButton(c.element))
  feedsCardsManager.addEventListener('addCard', e => injectButton(e.detail.element))
})()
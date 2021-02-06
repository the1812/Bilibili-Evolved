(async () => {
  // 动态详情页不需要开启
  const isNotFeedsHome = document.URL.includes('//t.bilibili.com') && document.URL.replace(window.location.search, '') !== 'https://t.bilibili.com/'
  // 动态话题页需要
  const isTopicPage = document.URL.startsWith('https://t.bilibili.com/topic/')
  if (isNotFeedsHome && !isTopicPage) {
    return
  }
  const { forEachFeedsCard, supportedUrls } = await import('../feeds-apis')
  if (supportedUrls.every(url => !document.URL.includes(url))) {
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
  forEachFeedsCard({
    added: c => injectButton(c.element)
  })
})()
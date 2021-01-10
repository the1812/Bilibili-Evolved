(async () => {
  if (document.URL.replace(window.location.search, '') !== 'https://t.bilibili.com/'
    && !document.URL.startsWith('https://space.bilibili.com')) {
    return
  }
  const { forEachFeedsCard } = await import('../feeds-apis')
  forEachFeedsCard({
    added: card => {
      const foldButton = dq(card.element, '.fold-hoverable') as HTMLElement
      if (!foldButton) {
        return
      }
      foldButton.click()
    },
  })
})()

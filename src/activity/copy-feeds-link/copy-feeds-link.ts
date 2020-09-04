import { FeedsCard } from '../feeds-apis'

(async () => {
  const urlList = [
    'https://t.bilibili.com/',
    'https://space.bilibili.com/',
    'https://live.bilibili.com/',
  ]
  if (urlList.every(url => !document.URL.includes(url))) {
    return
  }
  const { forEachFeedsCard } = await import('../feeds-apis')
  const addCopyLinkButton = (card: FeedsCard) => {
    const morePanel = dq(card.element, '.more-panel') as HTMLElement
    if (!morePanel || dq(morePanel, '.copy-link')) {
      return
    }
    const copyLinkButton = document.createElement('p')
    copyLinkButton.classList.add('child-button', 'c-pointer', 'copy-link')
    copyLinkButton.textContent = '复制链接'
    const vueScopeAttributes = [...new Set([...morePanel.children].map((element: HTMLElement) => {
      return element.getAttributeNames().filter(it => it.startsWith('data-v-'))
    }).flat())]
    vueScopeAttributes.forEach(attr => copyLinkButton.setAttribute(attr, ''))
    copyLinkButton.addEventListener('click', () => {
      GM_setClipboard(`https://t.bilibili.com/${card.id}`, { mimetype: 'text/plain' })
      card.element.click()
    })
    morePanel.appendChild(copyLinkButton)
  }
  forEachFeedsCard({
    added: addCopyLinkButton,
  })
})()

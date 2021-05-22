(async () => {
  const { waitForControlBar } = await import('../live-control-bar')
  const fullscreenGiftBoxClass = 'fullscreen-gift-box'
  let giftBoxButton: HTMLDivElement
  waitForControlBar({
    init: () => resources.applyImportantStyle('fullscreenGiftBoxStyle'),
    callback: async controlBar => {
      const rightController = dq(controlBar, '.right-area') as HTMLDivElement
      if (!rightController) {
        console.warn('[fullscreenGiftBox] ref elements not found', rightController === null)
        return
      }
      if (dq(rightController, `.${fullscreenGiftBoxClass}`)) {
        return
      }
      if (!giftBoxButton) {
        const originalGiftBoxClass = '.gift-package'
        giftBoxButton = document.createElement('div')
        giftBoxButton.innerHTML = '包裹'
        giftBoxButton.classList.add(fullscreenGiftBoxClass)
        giftBoxButton.addEventListener('click', () => {
          const button = dq(originalGiftBoxClass) as HTMLElement
          button?.click()
        })
      }
      rightController.appendChild(giftBoxButton)
    }
  })
})()
export default {
  reload: () => document.body.classList.remove('fullscreen-gift-box-unloaded'),
  unload: () => document.body.classList.add('fullscreen-gift-box-unloaded'),
}

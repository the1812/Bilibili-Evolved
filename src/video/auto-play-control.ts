;(async () => {
  const supportedUrls = [
    'https://www.bilibili.com/video/',
    'https://www.bilibili.com/watchlater/',
    'https://www.bilibili.com/medialist/play/',
  ]
  if (!supportedUrls.some(url => document.URL.startsWith(url))) {
    return
  }
  const autoPlayControls = {
    enable: ['.multi-page .next-button', '.player-auxiliary .player-auxiliary-autoplay-switch:not(:empty)'],
    disable: ['.recommend-list .next-button'],
  }
  const isChecked = (container: HTMLElement) => {
    return Boolean(container.querySelector('.switch-button.on, input:checked'))
  }
  const { playerReady } = await import('./player-ready')
  await playerReady()
  const element = await SpinQuery.select(
    [...autoPlayControls.enable, ...autoPlayControls.disable].join(',')
  )
  if (!element) {
    return
  }
  const shouldChecked = autoPlayControls.enable.some(selector => element.matches(selector))
  const checked = isChecked(element)
  console.log(checked, shouldChecked, element)
  if (shouldChecked !== checked) {
    element.click()
  }
})()

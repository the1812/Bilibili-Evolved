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
    enable: ['.multi-page .next-button', '.player-auxiliary-autoplay-switch input'],
    disable: ['.recommend-list .next-button'],
  }
  const disableConditions = [
    // 最后 1P 时不能开启连播
    () => Boolean(dq('.multi-page .list-box li.on:last-child')),
  ]
  const isChecked = (container: HTMLElement) => {
    return Boolean(container.querySelector('.switch-button.on, :checked'))
  }
  const { playerReady } = await import('./player-ready')
  await playerReady()
  const checkPlayMode = async () => {
    const element = await SpinQuery.select(
      [...autoPlayControls.disable, ...autoPlayControls.enable].join(',')
    )
    if (!element) {
      return
    }
    const shouldChecked = autoPlayControls.enable.some(selector => element.matches(selector)) && disableConditions.every(condition => !Boolean(condition()))
    const checked = isChecked(element)
    console.log(checked, shouldChecked, element)
    if (shouldChecked !== checked) {
      element.click()
    }
  }
  Observer.videoChange(() => {
    const video = dq('.bilibili-player-video video') as HTMLVideoElement
    checkPlayMode()
    video?.addEventListener('ended', checkPlayMode)
  })
})()

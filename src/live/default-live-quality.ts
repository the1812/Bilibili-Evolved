(async () => {
  if (!document.URL.match(/^https:\/\/live.bilibili.com\/(blanc\/)?(\d+)/)) {
    return
  }
  type LiveQuality = typeof settings.defaultLiveQuality
  const dropdown = Resource.all.useDefaultLiveQuality.dropdown as Dropdown
  const qualities = dropdown.items as LiveQuality[]
  const targetQuality = settings.defaultLiveQuality

  const qualitySettings = await SpinQuery.select('.bilibili-live-player-video-controller-switch-quality-btn') as HTMLElement
  if (qualitySettings === null) {
    console.warn('qualitySettings null')
    return
  }
  const setQuality = async () => {
    const currentQuality = qualitySettings.children[0].getAttribute('data-title') as LiveQuality
    // 特化点: 4K目前比原画还要高画质, 原画遇到4K需要取消执行
    if (currentQuality === '4K' && targetQuality === '原画') {
      console.log('stop for 4K')
      return
    }
    const qualityButtons = dqa(qualitySettings, '.bilibili-live-player-video-controller-html-tooltip-option .text-btn') as HTMLElement[]
    const availableQualities = qualityButtons.map(it => it.getAttribute('data-title') as LiveQuality)
    console.log(currentQuality, availableQualities, targetQuality)
    if (currentQuality !== targetQuality) {
      let quality = targetQuality
      while (!availableQualities.includes(quality)) { // 支持的清晰度里没有设定好的那个清晰度, 就从设定的清晰度往下降
        const index = qualities.indexOf(quality)
        if (index >= qualities.length - 1) { // 已经是最低清晰度, 取消执行
          console.log('reached lowest quality')
          return
        }
        quality = qualities[index + 1]
      }
      const button = qualityButtons[availableQualities.indexOf(quality)]
      console.log(button)
      while (!(button.classList.contains('active') || dq('.bilibili-live-player-video-controller-switch-quality-info'))) {
        await (() => new Promise(r => setTimeout(() => r(), 3000)))()
        button.click()
        console.log('click')
      }
    }
  }
  Observer.childList(qualitySettings, () => {
    console.log(qualitySettings.childElementCount)
    if (qualitySettings.childElementCount > 0) {
      setQuality()
    }
  })
})()
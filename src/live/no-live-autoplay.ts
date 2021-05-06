(async () => {
  const url = document.URL.replace(window.location.search, '')
  if (url !== 'https://live.bilibili.com/' && url !== 'https://live.bilibili.com/index.html') {
    return
  }
  // SpinQuery.condition(
  //   () => document.querySelector('.component-ctnr video,.bilibili-live-player-video video'),
  //   (video: HTMLVideoElement) => video && !video.paused,
  //   () => {
  //     const button = dq('.live-web-player-controller .left-area > :first-child') as HTMLElement
  //     button?.click()
  //   }
  // )
  SpinQuery.select('video').then((video: HTMLVideoElement) => video.pause())
  const styleID = 'hide-home-live-style'
  addSettingsListener('hideHomeLive', value => {
    if (value === true) {
      const style = document.createElement('style')
      style.innerText = `.player-area-ctnr,#player-header { display: none !important }`
      style.id = styleID
      document.body.append(style)
    } else {
      const style = document.getElementById(styleID)
      style && style.remove()
    }
  }, true)
})()
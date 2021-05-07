(async () => {
  const url = document.URL.replace(window.location.search, '')
  if (url !== 'https://live.bilibili.com/' && url !== 'https://live.bilibili.com/index.html') {
    return
  }
  // 不知道该怎么阻止自动播放了... (#1813)
  // 先屏蔽声音吧
  // SpinQuery.select('video').then((video: HTMLVideoElement) => {
  //   video.autoplay = false
  //   video.pause()
  // })
  SpinQuery.select('video').then((video: HTMLVideoElement) => {
    video.muted = true
  })
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
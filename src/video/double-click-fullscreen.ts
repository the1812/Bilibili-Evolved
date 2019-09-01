(async () => {
  const supportedUrls = [
    'https://www.bilibili.com/bangumi/',
    'https://www.bilibili.com/video/',
  ]
  if (!supportedUrls.some(url => document.URL.startsWith(url))) {
    return
  }
  if (settings.touchVideoPlayer && settings.touchVideoPlayerDoubleTapControl) {
    Toast.info('在开启了<span>播放器触摸支持-启用双击控制</span>后, <span>双击全屏</span>功能将无效.', '提示')
    settings.doubleClickFullscreen = false
    return
  }
  await SpinQuery.unsafeJquery()
  const playerArea = await SpinQuery.condition(
    () => dq('.bilibili-player-area'),
    it => it !== null && unsafeWindow.$('.bilibili-player-video').data('events')
  )
  if (playerArea === null) {
    return
  }
  const className = 'double-click-fullscreen'
  if (!playerArea.classList.contains(className)) {
    playerArea.classList.add(className)
    const video = unsafeWindow.$('.bilibili-player-video')
    // const originalClickHandler = video.data('events').click[0].handler
    const doubleClick = new DoubleClickEvent(
      () => (dq('.bilibili-player-video-btn-fullscreen') as HTMLDivElement).click(),
      () => {},
    )
    // video.unbind('click')
    doubleClick.bind(video[0])
  }
})()
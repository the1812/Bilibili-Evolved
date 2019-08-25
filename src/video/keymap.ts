Observer.videoChange(async () => {
  // const player = await SpinQuery.select('#bofqi') as HTMLDivElement
  const keymap = {
    w: '.bilibili-player-video-web-fullscreen', // 网页全屏
    t: '.bilibili-player-video-btn-widescreen', // 宽屏
    r: '.bilibili-player-video-btn-repeat', // 切换循环模式
    m: '.bilibili-player-video-btn-volume .bilibili-player-iconfont-volume', // 切换静音
  } as { [key: string]: string }
  document.body.addEventListener('keydown', e => {
    if (document.activeElement && ["input", "textarea"].includes(document.activeElement.nodeName.toLowerCase())) {
      return
    }
    const key = e.key.toLowerCase()
    if (key in keymap) {
      console.log(key)
      e.stopPropagation()
      e.preventDefault();
      (dq(keymap[key]) as HTMLElement).click()
    }
  })
})

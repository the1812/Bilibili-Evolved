Observer.videoChange(async () => {
  // const player = await SpinQuery.select('#bofqi') as HTMLDivElement
  const keymap = {
    w: '.bilibili-player-video-web-fullscreen',
    t: '.bilibili-player-video-btn-widescreen',
    r: '.bilibili-player-video-btn-repeat',
    m: '.bilibili-player-video-btn-volume .bilibili-player-iconfont-volume',
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

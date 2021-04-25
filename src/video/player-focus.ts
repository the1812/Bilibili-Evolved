(async () => {
  if (!document.URL.startsWith('https://www.bilibili.com/video/')) {
    return
  }
  const target = document.URL.includes('bangumi') ? '.bilibili-player' : '.video-info .video-title .tit'
  const element = await SpinQuery.select(target)
  const { playerReady } = await import('./player-ready')
  await playerReady()
  const { playerScrollPatch } = await import('./player-scroll-patch')
  await playerScrollPatch()
  console.log(element)
  if (element === null) {
    return
  }
  element.scrollIntoView()
  if (settings.playerFocusOffset !== 0) {
    window.scrollBy(0, settings.playerFocusOffset)
  }
  console.log(element.offsetTop, settings.playerFocusOffset, window.scrollY)
})()

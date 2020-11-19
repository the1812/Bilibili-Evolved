const target = document.URL.includes('bangumi') ? '#bilibili-player' : '.video-info .video-title .tit'
SpinQuery.select(target).then(async element => {
  const { playerReady } = await import('../player-ready')
  await playerReady()
  console.log(element)
  if (element === null) {
    return
  }
  element.scrollIntoView()
  if (settings.playerFocusOffset !== 0) {
    window.scrollBy(0, settings.playerFocusOffset)
  }
  console.log(element.offsetTop, settings.playerFocusOffset, window.scrollY)
})

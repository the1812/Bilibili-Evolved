async function skipChargeList () {
  const video = await SpinQuery.select(() => document.querySelector('video'))
  video && video.addEventListener('ended', async () => {
    const jumpButton = await SpinQuery.select(() => document.querySelector('.bilibili-player-electric-panel-jump'))
    jumpButton && jumpButton.click()
  })
}
Observer.videoChange(skipChargeList)
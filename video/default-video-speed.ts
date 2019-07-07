const setPlaybackRate = (video: HTMLVideoElement) => {
  const speed = parseFloat(settings.defaultVideoSpeed)
  video.playbackRate = speed
  SpinQuery.condition(
    () => video,
    () => video.playbackRate !== speed,
    () => video.playbackRate = speed
  )
}
Observer.videoChange(() => {
  const video = dq('.bilibili-player-video video') as HTMLVideoElement
  if (!video) {
    return
  }
  setPlaybackRate(video)
})
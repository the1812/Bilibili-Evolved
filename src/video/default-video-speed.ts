const setPlaybackRate = (video: HTMLVideoElement) => {
  const speed = parseFloat(settings.defaultVideoSpeed)
  video.playbackRate = speed
  SpinQuery.condition(
    () => video,
    () => video.playbackRate !== speed,
    () => video.playbackRate = speed
  )
}
Observer.videoChange(async () => {
  const video = await SpinQuery.select('.bilibili-player-video video') as HTMLVideoElement
  setPlaybackRate(video)
})
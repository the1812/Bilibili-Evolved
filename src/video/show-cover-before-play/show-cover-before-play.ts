const url = {
  include: [
    '//www.bilibili.com/video/',
    '//www.bilibili.com/bangumi/',
  ]
}
const styleID = 'showCoverBeforePlayStyle'
const entry = () => {
  Observer.videoChange(async () => {
    if (url.include.every(it => !document.URL.includes(it))) {
      return
    }
    resources.applyStyle(styleID)
    const aid = await SpinQuery.select(() => unsafeWindow.aid)
    if (!aid) {
      console.warn('[播放前显示封面] 未找到av号')
      return
    }
    const video = await SpinQuery.select('video') as HTMLVideoElement
    if (!video) {
      console.warn('[播放前显示封面] 未找到视频')
      return
    }
    const { VideoInfo } = await import('../video-info')
    const info = new VideoInfo(aid)
    await info.fetchInfo()
    document.body.style.setProperty('--cover-url', `url('${info.coverUrl}')`)
    video.addEventListener('play', () => {
      document.body.style.removeProperty('--cover-url')
    }, { once: true })
  })
}
entry()
export default {
  reload: () => resources.applyStyle(styleID),
  unload: () => resources.removeStyle(styleID),
}

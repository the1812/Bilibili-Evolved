const url = {
  include: [
    '//www.bilibili.com/video/',
    '//www.bilibili.com/bangumi/',
  ]
}
const styleID = 'showCoverBeforePlayStyle'
let lastAid: string
const entry = () => {
  const showCover = async () => {
    if (url.include.every(it => !document.URL.includes(it))) {
      return
    }
    resources.applyStyle(styleID)
    const aid = await SpinQuery.select(() => unsafeWindow.aid)
    if (!aid) {
      console.warn('[播放前显示封面] 未找到av号')
      return
    }
    if (aid === lastAid) {
      return
    }
    lastAid = aid
    const video = await SpinQuery.select('video') as HTMLVideoElement
    if (!video) {
      console.warn('[播放前显示封面] 未找到视频')
      return
    }
    if (!video.paused) {
      return
    }
    const { VideoInfo } = await import('../video-info')
    const info = new VideoInfo(aid)
    await info.fetchInfo()
    document.body.style.setProperty('--cover-url', `url('${info.coverUrl}')`)
    video.addEventListener('play', () => {
      document.body.style.removeProperty('--cover-url')
    }, { once: true })
  }
  // Observer.videoChange(showCover)
  showCover()
}
entry()
export default {
  reload: () => resources.applyStyle(styleID),
  unload: () => resources.removeStyle(styleID),
}

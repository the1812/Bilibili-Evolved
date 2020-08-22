const url = {
  include: [
    '//www.bilibili.com/video/',
    '//www.bilibili.com/bangumi/',
  ]
}
const styleID = 'showCoverBeforePlayStyle'
let lastCid: string
const entry = () => {
  if (url.include.every(it => !document.URL.includes(it))) {
    return
  }
  resources.applyStyle(styleID)
  const removeCover = () => document.body.style.removeProperty('--cover-url')
  const originalPlay = HTMLVideoElement.prototype.play
  HTMLVideoElement.prototype.play = function (...args: any[]) {
    removeCover()
    return originalPlay.call(this, ...args)
  }
  const showCover = async () => {
    const aid = await SpinQuery.select(() => unsafeWindow.aid)
    if (!aid) {
      console.warn('[播放前显示封面] 未找到av号')
      return
    }
    const { cid } = unsafeWindow
    if (cid === lastCid || !cid) {
      return
    }
    lastCid = cid
    // const video = await SpinQuery.select('video') as HTMLVideoElement
    // if (!video) {
    //   console.warn('[播放前显示封面] 未找到视频')
    //   return
    // }
    const { VideoInfo } = await import('../video-info')
    const info = new VideoInfo(aid)
    await info.fetchInfo()
    // const video = dq('video') as HTMLVideoElement
    // if (!video || !video.paused) {
    //   return
    // }
    document.body.style.setProperty('--cover-url', `url('${info.coverUrl}')`)
    // video.addEventListener('play', () => {
    //   removeCover()
    // }, { once: true })
    // unsafeWindow.trackingVideo = video
  }
  // Observer.videoChange(showCover)
  if (document.URL.includes('//www.bilibili.com/bangumi/')) {
    Observer.videoChange(showCover)
  } else {
    showCover()
  }
}
entry()
export default {
  reload: () => resources.applyStyle(styleID),
  unload: () => resources.removeStyle(styleID),
}

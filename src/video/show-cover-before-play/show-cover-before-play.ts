const url = {
  include: [
    '//www.bilibili.com/video/',
    '//www.bilibili.com/bangumi/',
  ]
}
const styleID = 'showCoverBeforePlayStyle'
let lastCid: string
const entry = () => {
  const showCover = async () => {
    if (url.include.every(it => !document.URL.includes(it))) {
      return
    }
    const removeCover = () => document.body.style.removeProperty('--cover-url')
    resources.applyStyle(styleID)
    const aid = await SpinQuery.select(() => unsafeWindow.aid)
    if (!aid) {
      console.warn('[播放前显示封面] 未找到av号')
      removeCover()
      return
    }
    const { cid } = unsafeWindow
    if (cid === lastCid || !cid) {
      removeCover()
      return
    }
    lastCid = cid
    const video = await SpinQuery.select('video') as HTMLVideoElement
    if (!video) {
      console.warn('[播放前显示封面] 未找到视频')
      removeCover()
      return
    }
    const { VideoInfo } = await import('../video-info')
    const info = new VideoInfo(aid)
    await info.fetchInfo()
    if (!video.paused) {
      removeCover()
      return
    }
    document.body.style.setProperty('--cover-url', `url('${info.coverUrl}')`)
    video.addEventListener('play', () => {
      removeCover()
    }, { once: true })
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

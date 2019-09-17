const supportedUrls = [
  'https://www.bilibili.com/bangumi/',
  'https://www.bilibili.com/video/',
]
if (supportedUrls.some(url => document.URL.startsWith(url))) {
  const clickableKeymap = {
    w: '.bilibili-player-video-web-fullscreen', // 网页全屏
    t: '.bilibili-player-video-btn-widescreen', // 宽屏
    r: '.bilibili-player-video-btn-repeat', // 切换循环模式
    m: '.bilibili-player-video-btn-volume .bilibili-player-iconfont-volume', // 切换静音
    l: '.video-toolbar .like', // 点赞
    c: '.video-toolbar .coin,.tool-bar .coin-info', // 投币
    s: '.video-toolbar .collect', // 收藏
  } as { [key: string]: string }
  document.body.addEventListener('keydown', e => {
    if (document.activeElement && ["input", "textarea"].includes(document.activeElement.nodeName.toLowerCase())) {
      return
    }
    const key = e.key.toLowerCase()
    const noModifyKeys = !e.shiftKey && !e.altKey && !e.ctrlKey
    if (key in clickableKeymap && noModifyKeys) {
      const element = dq(clickableKeymap[key]) as HTMLElement
      if (!element) {
        return
      }
      e.stopPropagation()
      e.preventDefault()
      element.click()
    } else if (key === 'd' && noModifyKeys) { // 切换弹幕开关
      const checkbox = dq('.bilibili-player-video-danmaku-switch input') as HTMLInputElement
      if (!checkbox) {
        return
      }
      e.stopPropagation()
      e.preventDefault()
      checkbox.checked = !checkbox.checked
      raiseEvent(checkbox, 'change')
    } else if (e.shiftKey) {
      const video = dq('.bilibili-player-video video') as HTMLVideoElement
      if (video === null) {
        return
      }
      e.stopPropagation()
      e.preventDefault()
      const playbackRates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]
      if (key === '>' || key === 'ArrowUp'.toLowerCase()) {
        video.playbackRate = playbackRates.find(it => it > video.playbackRate) || playbackRates[playbackRates.length - 1]
      } else if (key === '<' || key === 'ArrowDown'.toLowerCase()) {
        video.playbackRate = playbackRates.find(it => it < video.playbackRate) || playbackRates[0]
      } else if (key === '?') {
        video.playbackRate = 1
      } else if (key === 'w') {
        const watchlater = dq('.video-toolbar .ops .watchlater,.more-ops-list .ops-watch-later') as HTMLSpanElement
        if (watchlater !== null) {
          watchlater.click()
        }
      }
    }
  })
}

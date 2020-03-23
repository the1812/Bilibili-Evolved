const supportedUrls = [
  'https://www.bilibili.com/bangumi/',
  'https://www.bilibili.com/video/',
]
if (supportedUrls.some(url => document.URL.startsWith(url))) {
  const clickableKeymap = {
    f: '.bilibili-player-video-fullscreen', // 全屏
    w: '.bilibili-player-video-web-fullscreen', // 网页全屏
    t: '.bilibili-player-video-btn-widescreen', // 宽屏
    r: '.bilibili-player-video-btn-repeat', // 切换循环模式
    m: '.bilibili-player-video-btn-volume .bilibili-player-iconfont-volume', // 切换静音
    // l: '.video-toolbar .like', // 点赞
    c: '.video-toolbar .coin,.tool-bar .coin-info', // 投币
    s: '.video-toolbar .collect', // 收藏
    ' ': '.bilibili-player-video-btn-start', // 砸瓦撸多
  } as { [key: string]: string }
  let likeClick = true
  let showPlaybackTipOldTimeout: number
  const showPlaybackTip = (speed: number) => {
    let tip = dq('.keymap-playback-tip') as HTMLDivElement
    if (!tip) {
      const player = dq('.bilibili-player-video-wrap')
      if (!player) {
        return
      }
      player.insertAdjacentHTML('afterbegin', /*html*/`
        <div class="keymap-playback-tip-container">
          <i class="mdi mdi-fast-forward"></i>
          <div class="keymap-playback-tip"></div>x
        </div>
      `)
      resources.applyStyleFromText(`
        .keymap-playback-tip-container {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          padding: 8px 16px;
          background-color: #000A;
          color: white;
          pointer-events: none;
          opacity: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          font-size: 14pt;
          border-radius: 4px;
          transition: .2s ease-out;
        }
        .keymap-playback-tip-container.show {
          opacity: 1;
        }
        .keymap-playback-tip-container i {
          line-height: 1;
          margin-right: 8px;
          font-size: 18pt;
        }
      `, 'keymapStyle')
      tip = dq('.keymap-playback-tip') as HTMLDivElement
    }
    tip.innerHTML = speed.toString()
    if (showPlaybackTipOldTimeout) {
      clearTimeout(showPlaybackTipOldTimeout)
    }
    (dq('.keymap-playback-tip-container') as HTMLDivElement).classList.add('show')
    showPlaybackTipOldTimeout = setTimeout(() => {
      (dq('.keymap-playback-tip-container') as HTMLDivElement).classList.remove('show')
    }, 2000)
  }
  document.body.addEventListener('keydown', e => {
    if (document.activeElement && ["input", "textarea"].includes(document.activeElement.nodeName.toLowerCase())) {
      return
    }
    const key = e.key.toLowerCase()
    const noModifyKeys = !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey
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
    } else if (key === 'j' && noModifyKeys) { // 绯红之王
      const video = dq('.bilibili-player-video video') as HTMLVideoElement
      video.currentTime += settings.keymapJumpSeconds
      e.stopPropagation()
      e.preventDefault()
    } else if (key === 'l' && noModifyKeys) {
      const likeButton = dq('.video-toolbar .like') as HTMLSpanElement
      e.preventDefault()
      const fireEvent = (name: string, args: Event) => {
        const event = new CustomEvent(name, args)
        likeButton.dispatchEvent(event)
      }
      likeClick = true
      setTimeout(() => likeClick = false, 200)
      fireEvent('mousedown', e)
      document.body.addEventListener('keyup', e => {
        e.preventDefault()
        fireEvent('mouseup', e)
        if (likeClick) {
          fireEvent('click', e)
        }
      }, { once: true })
    } else if (e.shiftKey) {
      const video = dq('.bilibili-player-video video') as HTMLVideoElement
      if (video === null) {
        return
      }
      const playbackRates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0]
      let preventDefault = true
      if (key === '>' || key === 'ArrowUp'.toLowerCase()) { // 天堂制造
        video.playbackRate = playbackRates.find(it => it > video.playbackRate) || playbackRates[playbackRates.length - 1]
        showPlaybackTip(video.playbackRate)
      } else if (key === '<' || key === 'ArrowDown'.toLowerCase()) { // 时间减速
        video.playbackRate = [...playbackRates].reverse().find(it => it < video.playbackRate) || playbackRates[0]
        showPlaybackTip(video.playbackRate)
      } else if (key === '?') { // 重置速度
        video.playbackRate = 1
        showPlaybackTip(video.playbackRate)
      } else if (key === 'w') { // 稍后再看
        const watchlater = dq('.video-toolbar .ops .watchlater,.more-ops-list .ops-watch-later') as HTMLSpanElement
        if (watchlater !== null) {
          watchlater.click()
        }
      } else if (key === 'j') { // 败者食尘
        video.currentTime -= settings.keymapJumpSeconds
      } else {
        preventDefault = false
      }

      if (preventDefault) {
        e.stopPropagation()
        e.preventDefault()
      }
    }
  })
}

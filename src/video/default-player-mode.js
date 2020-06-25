if (typeof isEmbeddedPlayer !== 'undefined' && isEmbeddedPlayer()) {
  return
}
const playerModes = [
  {
    name: '常规',
    action: () => { }
  },
  {
    name: '宽屏',
    action: () => {
      document.querySelector('.bilibili-player-video-btn-widescreen').click()
      // document.querySelector("#bofqi").scrollIntoView({ behavior: "smooth" });
    }
  },
  {
    name: '网页全屏',
    action: () => {
      document.querySelector('.bilibili-player-video-web-fullscreen').click()
    }
  },
  {
    name: '全屏',
    action: async () => {
      const video = await SpinQuery.condition(
        () => document.querySelector('.bilibili-player-video video'),
        it => {
          return it !== null && it.readyState === 4 &&
            document.readyState === 'complete' && document.hasFocus()
        })
      if (video === null) {
        console.warn('[默认播放器模式] 未能应用全屏模式, 等待超时.')
        return
      }
      document.querySelector('.bilibili-player-video-btn-fullscreen').click()
    }
  }
]
let lightOff = () => { }
let lightOn = () => { }
async function initLights () {
  if (settings.autoLightOff) {
    await SpinQuery.unsafeJquery()
    const settingsButton = await SpinQuery.any(() => unsafeWindow.$('.bilibili-player-video-btn-setting'))
    if (!settingsButton) {
      return
    }
    settingsButton.mouseover().mouseout()
    const setLight = async lightOff => {
      const checkbox = await SpinQuery.select(
        '.bilibili-player-video-btn-setting-right-others-content-lightoff .bui-checkbox-input'
      )
      checkbox.checked = lightOff
      raiseEvent(checkbox, 'change')
    }
    lightOff = () => setLight(true)
    lightOn = () => setLight(false)
  }
}
async function main () {
  await initLights()
  await SpinQuery.condition(
    () => $('.bilibili-player-video,.bilibili-player-video-btn-start,.bilibili-player-area'),
    it => it.length === 3 && $('video').length > 0 && $('video').prop('duration'))

  const video = document.querySelector('video')
  if (!video) {
    return
  }
  const info = playerModes.find(it => it.name === settings.defaultPlayerMode)
  // if (info.name === "全屏")
  // {
  //     const unsafe$ = await SpinQuery.unsafeJquery();
  //     const playButton = document.querySelector(".bilibili-player-video-btn-start");
  //     const playerButtonClick = () =>
  //     {
  //         const events = unsafe$(".bilibili-player-video-btn-fullscreen").data("events");
  //         if (events.click && events.click[0] && events.click[0].handler)
  //         {
  //             const handler = unsafe$(".bilibili-player-video-btn-fullscreen").data("events").click[0].handler;
  //             console.log(handler);
  //             handler();
  //         }

  //         playButton.removeEventListener("click", playerButtonClick);
  //     };
  //     playButton.addEventListener("click", playerButtonClick);
  // }
  // else
  {
    const onplay = () => {
      if (info && $('#bilibiliPlayer[class*=mode-]').length === 0) {
        info.action()
      }
    }
    const autoPlay = _.get(JSON.parse(localStorage.getItem('bilibili_player_settings')), 'video_status.autoplay', false)
    if (settings.applyPlayerModeOnPlay && !autoPlay) {
      video.addEventListener('play', onplay, { once: true })
    } else {
      onplay()
    }

    // if (!autoPlay) {
    //   video.addEventListener('play', lightOff, { once: true })
    // } else {
    //   lightOff()
    // }
    if (autoPlay) {
      lightOff()
    }
    video.addEventListener('ended', lightOn)
    video.addEventListener('pause', lightOn)
    video.addEventListener('play', lightOff)
  }
}
Observer.videoChange(main)

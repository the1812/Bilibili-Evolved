const inBlacklist = () => settings.defaultVideoSpeedBlacklist.some(val => val === unsafeWindow.aid)

const changeState = (button: HTMLButtonElement, icon: HTMLElement, label: HTMLSpanElement, state: boolean) => {
  if (state) {
    icon.className = "icon-play"
  } else {
    const defaultVideoSpeed = parseFloat(settings.defaultVideoSpeed)
    if (defaultVideoSpeed < 1) {
      icon.className = "icon-speed-down"
    } else if (defaultVideoSpeed > 1) {
      icon.className = "icon-speed-up"
    } else {
      icon.className = "icon-play"
    }
  }
  if (state) {
    label.innerText = "使用"
    button.title = "标记当前视频使用默认播放速度（适用于实况类、学习类等视频），刷新后生效。"
  } else {
    label.innerText = "排除"
    button.title = "标记当前视频不使用默认播放速度（适用于音乐类、鬼畜类等视频），刷新后生效。"
  }
}

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
  if (inBlacklist()) {
    return
  }
  const video = await SpinQuery.select('.bilibili-player-video video') as HTMLVideoElement
  setPlaybackRate(video)
})

export default {
  widget: {
    content: /*html*/`
      <button class="gui-settings-flat-button" style="position: relative; z-index: 100;" id="toggle-default-video-speed">
        <i class="icon-play"></i>
        <span class="toggle-text"></span>
        <span>默认播放速度</span>
      </button>`,
    condition: async () => {
      return await videoCondition() && settings.useDefaultVideoSpeed
    },
    success: () => {
      const button = dq('#toggle-default-video-speed') as HTMLButtonElement
      const icon = dq("#toggle-default-video-speed i") as HTMLElement
      const label = dq("#toggle-default-video-speed .toggle-text") as HTMLSpanElement

      changeState(button, icon, label, inBlacklist())

      button.addEventListener('click', async () => {
        try {
          button.disabled = true
          if (!unsafeWindow.aid) {
            throw "aid is undefined"
          }
          let state = inBlacklist()
          if (state) {
            settings.defaultVideoSpeedBlacklist.splice(settings.defaultVideoSpeedBlacklist.indexOf(unsafeWindow.aid), 1)
          } else {
            settings.defaultVideoSpeedBlacklist.push(unsafeWindow.aid)
          }
          settings.defaultVideoSpeedBlacklist = settings.defaultVideoSpeedBlacklist
          state = !state
          changeState(button, icon, label, state)
        } catch (error) {
          logError(error)
        } finally {
          button.disabled = false
        }
      })
    },
  }
}
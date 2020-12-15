const indexOfCurrentAid = () => settings.defaultVideoSpeedBlacklist.indexOf(unsafeWindow.aid as string)

const getNativeDefaultPlaySpeed = () => {
  try {
    return parseFloat(JSON.parse(sessionStorage.getItem("bilibili_player_settings") as string).video_status.videospeed || 1)
  } catch {
    return 1
  }
}

const setPlaybackRate = async (speed: number) => {
  const video = await SpinQuery.select('.bilibili-player-video video') as HTMLVideoElement
  video.playbackRate = speed
  SpinQuery.condition(
    () => video,
    () => video.playbackRate !== speed,
    () => video.playbackRate = speed
  )
}

const updateWidget = (button: HTMLButtonElement, icon: HTMLElement, label: HTMLSpanElement, state: boolean) => {
  if (state) {
    icon.className = "icon-play"
    label.innerText = "原生"
    button.title = "当前视频使用 B 站原生默认播放速度（适用于音乐类、鬼畜类等视频）"
  } else {
    label.innerText = "自定义"
    button.title = "当前视频使用脚本自定义的默认播放速度（适用于实况类、学习类等视频）"

    const defaultVideoSpeed = parseFloat(settings.defaultVideoSpeed)

    if (defaultVideoSpeed < 1) {
      icon.className = "icon-speed-down"
    } else if (defaultVideoSpeed > 1) {
      icon.className = "icon-speed-up"
    } else {
      icon.className = "icon-play"
    }
  }
}

Observer.videoChange(async () => {
  if (indexOfCurrentAid() === -1) {
    await setPlaybackRate(parseFloat(settings.defaultVideoSpeed))
  }
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
    success: async () => {
      const button = dq('#toggle-default-video-speed') as HTMLButtonElement
      const icon = dq("#toggle-default-video-speed i") as HTMLElement
      const label = dq("#toggle-default-video-speed .toggle-text") as HTMLSpanElement

      updateWidget(button, icon, label, indexOfCurrentAid() !== -1)

      button.addEventListener('click', async () => {
        try {
          button.disabled = true
          if (!unsafeWindow.aid) {
            throw "aid is undefined"
          }
          const index = indexOfCurrentAid()
          const state = index !== -1
          if (state) {
            settings.defaultVideoSpeedBlacklist.splice(index, 1)
            await setPlaybackRate(parseFloat(settings.defaultVideoSpeed))
          } else {
            settings.defaultVideoSpeedBlacklist.push(unsafeWindow.aid)
            await setPlaybackRate(getNativeDefaultPlaySpeed())
          }
          settings.defaultVideoSpeedBlacklist = settings.defaultVideoSpeedBlacklist
          updateWidget(button, icon, label, !state)
        } catch (error) {
          logError(error)
        } finally {
          button.disabled = false
        }
      })
    },
  }
}
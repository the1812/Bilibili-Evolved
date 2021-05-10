let videoEl: HTMLVideoElement
let playerWrap: HTMLElement
let observer: IntersectionObserver
let intersectionLock = true // Lock intersection action

enum MODE {
  TOP = '视频顶部',
  MID = '视频中间',
  BOT = '视频底部',
}

function getToTop(_mode: string): number {
  switch (_mode) {
    case MODE.TOP:
      return 1
    case MODE.MID:
      return 0.5
    case MODE.BOT:
      return 0
    default:
      return 0.5
  }
}

// TODO: refactor to light API
let lightOff = () => { }
let lightOn = () => { }
async function initLights() {
  await SpinQuery.unsafeJquery()
  const settingsButton = await SpinQuery.any(() =>
    unsafeWindow.$('.bilibili-player-video-btn-setting')
  )
  if (!settingsButton) {
    return
  }
  settingsButton.mouseover().mouseout()
  const setLight = async (state: boolean) => {
    const checkbox = (await SpinQuery.select(
      '.bilibili-player-video-btn-setting-right-others-content-lightoff .bui-checkbox-input'
    )) as HTMLInputElement
    checkbox.checked = state
    raiseEvent(checkbox, 'change')
  }
  lightOff = () => setLight(true)
  lightOn = () => setLight(false)
}

function addPlayerOutEvent() {
  // window.addEventListener('scroll', onPlayerOutEvent, { passive: true });
  observer.observe(playerWrap)
}

function removePlayerOutEvent() {
  // window.removeEventListener('scroll', onPlayerOutEvent);
  observer.unobserve(playerWrap)
}

let intersectingCall = () => {
  if (intersectionLock) return
  intersectionLock = true // relock
  if (settings.scrollOutPlayerAutoPause && videoEl.paused) {
    videoEl.play()
  }
  if (
    settings.scrollOutPlayerAutoLightOn &&
    settings.useDefaultPlayerMode &&
    settings.autoLightOff &&
    !settings.scrollOutPlayerAutoPause &&
    !videoEl.paused
  ) {
    lightOff()
  }
}

let disIntersectingCall = () => {
  // if video is playing, unlock intersecting action
  if (!videoEl.paused) {
    intersectionLock = false
  }
  if (settings.scrollOutPlayerAutoPause && !videoEl.paused) {
    videoEl.pause()
  }
  if (
    settings.scrollOutPlayerAutoLightOn &&
    settings.useDefaultPlayerMode &&
    settings.autoLightOff &&
    !settings.scrollOutPlayerAutoPause
  ) {
    lightOn()
  }
}

let createObserver = (mode?: string) =>
  new IntersectionObserver(
    ([e]) => {
      e.isIntersecting ? intersectingCall() : disIntersectingCall()
    },
    {
      root: document,
      threshold: getToTop(mode ? mode : settings.scrollOutPlayerTriggerPlace),
    }
  )

function mountPlayListener() {
  Observer.videoChange(async () => {
    videoEl.addEventListener('play', addPlayerOutEvent)
    // videoEl.addEventListener('pause', removePlayerOutEvent);
    videoEl.addEventListener('ended', removePlayerOutEvent)
  })
}

(async function setup() {
  await initLights()
  addSettingsListener('scrollOutPlayerTriggerPlace', (value) => {
    removePlayerOutEvent()
    observer = createObserver(value)
    addPlayerOutEvent()
  })
  videoEl = dq('.bilibili-player-video video') as HTMLVideoElement
  playerWrap = (dq('.player-wrap') || dq('.player-module')) as HTMLElement
  observer = createObserver()
  mountPlayListener()
})()

export default {
  reload: () => {
    addPlayerOutEvent()
    mountPlayListener()
  },
  unload: () => {
    // umount player listener
    Observer.videoChange(async () => {
      videoEl.removeEventListener('play', addPlayerOutEvent)
      // videoEl.removeEventListener('pause', removePlayerOutEvent);
      videoEl.removeEventListener('ended', removePlayerOutEvent)
    })
    removePlayerOutEvent()
  },
}

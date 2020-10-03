import { DanmakuRecord } from '../video-danmaku'

let enabled = true
const airborneStyleKey = 'airborneStyle'
;(async () => {
  if (!document.URL.match(/\/\/www\.bilibili\.com\/video\//)) {
    return
  }
  const { forEachVideoDanmaku } = await import('../video-danmaku')
  resources.applyStyle(airborneStyleKey)
  const getAirborneTime = (text: string | null) => {
    if (!text) {
      return NaN
    }
    const airborneMatch = text.match(/(\d+)[ ]*[:：.][ ]*(\d+)([ ]*[:：][ ]*(\d+))?/)
    if (!airborneMatch) {
      return NaN
    }
    if (airborneMatch[3]) { // 含有小时
      const [, hour, minute, , second] = airborneMatch.map(r => parseInt(r))
      if ([hour, minute, second].some(v => Number.isNaN(v))) {
        return NaN
      }
      return hour * 3600 + minute * 60 + second
    }
    const [, minute, second] = airborneMatch.map(r => parseInt(r))
    if ([minute, second].some(v => Number.isNaN(v))) {
      return NaN
    }
    return minute * 60 + second
  }
  const airborneHandler = (e: MouseEvent) => {
    if (!enabled) {
      return
    }
    const target = e.target as HTMLElement
    if (!target.classList.contains('b-danmaku')) {
      return
    }
    const time = getAirborneTime(target.textContent)
    if (!Number.isNaN(time)) {
      const video = dq('video') as HTMLVideoElement
      video.currentTime = time
      video.play()
    }
  }
  const addAirborneStyle = (danmaku: DanmakuRecord) => {
    const canAirborne = !Number.isNaN(getAirborneTime(danmaku.text))
    danmaku.element.classList.toggle('airborne', canAirborne)
  }
  forEachVideoDanmaku({ added: addAirborneStyle })
  Observer.videoChange(async () => {
    const wrapper = await SpinQuery.select('.bilibili-player-video-wrap') as HTMLElement
    if (wrapper.classList.contains('airborne-enabled')) {
      return
    }
    wrapper.classList.add('airborne-enabled')
    wrapper.addEventListener('click', airborneHandler)
  })
})()
export default {
  reload: () => {
    enabled = true
    resources.applyStyle(airborneStyleKey)
  },
  unload: () => {
    enabled = false
    resources.removeStyle(airborneStyleKey)
  },
}

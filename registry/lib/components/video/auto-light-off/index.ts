import { ComponentMetadata } from '@/components/types'
import { select } from '@/core/spin-query'

let videoEl: HTMLVideoElement
const initLights = async () => {
  const settingsButton = await select('.bilibili-player-video-btn-setting')
  if (!settingsButton) {
    return
  }
  const mouseEvent = new Event('mouseover')
  const mouseOut = new Event('mouseout')
  settingsButton.dispatchEvent(mouseEvent)
  settingsButton.dispatchEvent(mouseOut)
}
export const setLight = async (state: 'off' | 'on') => {
  const { raiseEvent } = await import('@/core/utils')
  const checkbox = dq(
    '.bilibili-player-video-btn-setting-right-others-content-lightoff .bui-checkbox-input',
  ) as HTMLInputElement
  checkbox.checked = state === 'off'
  raiseEvent(checkbox, 'change')
}

const LightOff = () => setLight('off')
const LightOn = () => setLight('on')
const reload = async () => {
  videoEl = dq('.bilibili-player-video video') as HTMLVideoElement
  // if video is playing, try light off.
  !videoEl.paused ? LightOff() : ''
  videoEl.addEventListener('play', LightOff)
  videoEl.addEventListener('pause', LightOn)
  videoEl.addEventListener('ended', LightOn)
}

const unload = () => {
  LightOn()
  videoEl.removeEventListener('play', LightOff)
  videoEl.removeEventListener('pause', LightOn)
  videoEl.removeEventListener('ended', LightOn)
  videoEl = null
}
const entry = async () => {
  await initLights()
  reload()
}

export const component: ComponentMetadata = {
  name: 'autoLightOff',
  displayName: '自动关灯',
  entry,
  reload,
  unload,
  description: '视频播放时自动关灯',
  tags: [componentsTags.video],
  enabledByDefault: true,
}

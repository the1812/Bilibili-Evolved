import { select } from '@/core/spin-query'
import { raiseEvent } from '@/core/utils'
import { loadLazyPlayerSettingsPanel } from '@/core/utils/lazy-panel'

let initialized = false
const setLight = (on: boolean) => {
  if (!initialized) {
    console.log('initialized')
    loadLazyPlayerSettingsPanel(
      '.bilibili-player-video-btn-setting',
      '.bilibili-player-video-btn-setting-wrap',
      {
        enterDelay: 1000,
        leaveDelay: 1000,
        style: '.bilibili-player-video-btn-setting-wrap { display: none !important }',
      },
    )
    initialized = true
  }
  return async () => {
    const checkbox = await select('.bilibili-player-video-btn-setting-right-others-content-lightoff .bui-checkbox-input') as HTMLInputElement
    checkbox.checked = !on
    raiseEvent(checkbox, 'change')
  }
}
export const lightOn = setLight(true)
export const lightOff = setLight(false)

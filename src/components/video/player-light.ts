import { select } from '@/core/spin-query'
import { matchUrlPattern, raiseEvent, none } from '@/core/utils'
import { loadLazyPlayerSettingsPanel } from '@/core/utils/lazy-panel'
import { playerUrls } from '@/core/utils/urls'

let initialized = false
const setLight = (on: boolean) => {
  if (!playerUrls.some(url => matchUrlPattern(url))) {
    return none
  }
  return async () => {
    if (!initialized) {
      loadLazyPlayerSettingsPanel(
        '.bilibili-player-video-btn-setting',
        '.bilibili-player-video-btn-setting-wrap',
        {
          style: '.bilibili-player-video-btn-setting-wrap { display: none !important }',
        },
      )
      initialized = true
    }
    const checkbox = await select('.bilibili-player-video-btn-setting-right-others-content-lightoff .bui-checkbox-input') as HTMLInputElement
    checkbox.checked = !on
    raiseEvent(checkbox, 'change')
  }
}
export const lightOn = setLight(true)
export const lightOff = setLight(false)

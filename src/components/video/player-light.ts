import { select } from '@/core/spin-query'
import { matchUrlPattern, raiseEvent, none } from '@/core/utils'
import { loadLazyPlayerSettingsPanel } from '@/core/utils/lazy-panel'
import { playerUrls } from '@/core/utils/urls'

let initialized = false

const setLightAdaptor = {
  bangumi: (doLightOn: boolean) => async () => {
    if (!initialized) {
      loadLazyPlayerSettingsPanel('.squirtle-setting-wrap', '.squirtle-video-setting')
      initialized = true
    }
    const checkbox = await select('.squirtle-lightoff') as HTMLElement
    const event = new MouseEvent('click')
    // 处于关灯状态，要开灯 -> 开灯
    checkbox.classList.contains('active') && doLightOn ? checkbox.dispatchEvent(event) : ''
    // 处于开灯状态，要关灯 -> 关灯
    !checkbox.classList.contains('active') && !doLightOn ? checkbox.dispatchEvent(event) : ''
  },
  fallback: (on: boolean) => {
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
  },
}

let setLight = setLightAdaptor.fallback
for (const key in setLightAdaptor) {
  if (Object.prototype.hasOwnProperty.call(setLightAdaptor, key)) {
    if (matchUrlPattern(key)) {
      setLight = setLightAdaptor[key]
    }
  }
}
export const lightOn = setLight(true)
export const lightOff = setLight(false)

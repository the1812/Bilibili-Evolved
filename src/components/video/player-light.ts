import { matchUrlPattern, none } from '@/core/utils'
import { loadLazyPlayerSettingsPanel } from '@/core/utils/lazy-panel'
import { playerUrls } from '@/core/utils/urls'
import { playerAgent } from './player-agent'

// let initialized = false

const setLight = (on?: boolean) => {
  if (!playerUrls.some(url => matchUrlPattern(url))) {
    return none
  }
  return async () => {
    const playerAgentInstance = playerAgent
    const {
      query: {
        control: { settings, buttons },
      },
    } = playerAgentInstance

    // if (!initialized) {
    loadLazyPlayerSettingsPanel(buttons.settings.selector, settings.wrap.selector)
    // initialized = true
    // }
    playerAgentInstance.toggleLight(on)
  }
}

export const lightOn = setLight(true)
export const lightOff = setLight(false)
export const toggleLight = setLight()

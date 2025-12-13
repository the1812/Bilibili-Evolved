import { isBwpVideo } from '@/core/utils'
import { PlayerAgent, selectorWrap } from './base'
import { PlayerQuery, ElementQuery, AgentType } from './types'
import { select } from '@/core/spin-query'
import { bpxSelectors } from './bpx'

export class VideoPlayerBpxAgent extends PlayerAgent {
  type: AgentType = 'video'

  query = selectorWrap({
    playerWrap: '.player-wrap',
    bilibiliPlayer: '#bilibili-player',
    ...bpxSelectors,
  }) as PlayerQuery<ElementQuery>

  constructor() {
    super()
    this.checkBwpVideo()
  }

  checkBwpVideo() {
    const videoSelector = this.query.video.element.selector
    const bwpSelector = '.bilibili-player-video bwp-video,.bpx-player-video-area bwp-video'
    this.query.video.element = (() => {
      const func = async () => {
        if (await isBwpVideo()) {
          return select<HTMLElement>(bwpSelector)
        }
        return select<HTMLElement>(videoSelector)
      }
      func.selector = videoSelector
      func.sync = () => dq(videoSelector) as HTMLElement
      isBwpVideo().then(bwp => {
        if (!bwp) {
          return
        }
        func.selector = bwpSelector
        func.sync = () => dq(bwpSelector) as HTMLElement
      })
      return func
    })()
  }

  toggleSubtitle(): HTMLElement {
    const closeSwitch = dq('.bpx-player-ctrl-subtitle-close-switch') as HTMLDivElement | null
    const isDisabled = closeSwitch?.classList.contains('bpx-state-active')
    if (!isDisabled) {
      closeSwitch?.click()
      return
    }
    const subtitleOptions = dqa(
      '.bpx-player-ctrl-subtitle-major .bpx-player-ctrl-subtitle-language-item',
    ) as HTMLDivElement[]
    const subtitleLanguage = this.getPlayerConfig<null, string>('subtitle.lan', null)
    if (subtitleLanguage === null) {
      subtitleOptions.at(0)?.click()
      return
    }
    subtitleOptions.find(it => it.dataset.lan === subtitleLanguage)?.click()
  }
}

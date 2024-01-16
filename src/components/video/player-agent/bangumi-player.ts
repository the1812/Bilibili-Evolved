import { PlayerAgent, selectorWrap } from './base'
import { bpxSelectors } from './bpx'
import { AgentType, PlayerQuery, ElementQuery } from './types'

export class BangumiPlayerAgent extends PlayerAgent {
  type: AgentType = 'bangumi'

  query = selectorWrap({
    playerWrap: '#bilibili-player-wrap',
    bilibiliPlayer: '#bilibili-player',
    ...bpxSelectors,
  }) as PlayerQuery<ElementQuery>

  constructor() {
    super()
  }

  seek(time: number) {
    const seekResult = super.seek(time)
    if (seekResult === null) {
      return seekResult
    }
    setTimeout(() => {
      const toastText = dq('.bpx-player-toast-row .bpx-player-toast-item .bpx-player-toast-text')
      if (toastText?.textContent?.startsWith('已为您定位至')) {
        toastText.textContent = '已为您定位至00:00'
      }
    })
    return seekResult
  }
}

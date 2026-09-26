import { playerAgent } from '@/components/video/player-agent'
import type { PlayerAgentDanmakuSwitchState } from '@/components/video/player-agent'
import { addStyle } from '@/core/style'
import playerTipStyle from './player-tip.scss'

/** 提示框样式只需注入一次 */
const ensureStyle = lodash.once(() => addStyle(playerTipStyle, 'player-tip'))
/** 提示框用的 `setTimeout` 句柄 */
let tipTimeoutHandle: number

/**
 * 在播放器中央显示提示框
 * @param text 文字 (可以 HTML)
 * @param icon MDI 图标 class
 */
export const showPlayerTip = async (text: string, icon: string) => {
  ensureStyle()
  let tip = dq('.player-tip') as HTMLDivElement
  if (!tip) {
    const player = (await playerAgent.query.playerArea()) as HTMLElement
    if (!player) {
      return
    }
    player.insertAdjacentHTML(
      'afterbegin',
      /* html */ `
      <div class="player-tip-container">
        <i class="player-tip-icon mdi ${icon}"></i>
        <div class="player-tip">${text}</div>
      </div>
    `,
    )
    tip = dq('.player-tip') as HTMLDivElement
  }
  tip.innerHTML = text
  const container = dq('.player-tip-container') as HTMLDivElement
  const iconElement = dq(container, '.mdi') as HTMLElement
  iconElement.classList.remove(...iconElement.classList.values())
  iconElement.classList.add('mdi', icon)
  if (tipTimeoutHandle) {
    clearTimeout(tipTimeoutHandle)
  }
  container.classList.add('show')
  tipTimeoutHandle = window.setTimeout(() => {
    container.classList.remove('show')
  }, 2000)
}

/** 弹幕开关各状态对应的提示 */
const danmakuStateTips: Record<PlayerAgentDanmakuSwitchState, { text: string; icon: string }> = {
  on: { text: '开启弹幕', icon: 'mdi-comment-text' },
  concise: { text: '精简弹幕', icon: 'mdi-filter-variant' },
  off: { text: '关闭弹幕', icon: 'mdi-comment-remove' },
}
/** 显示弹幕开关状态提示 */
export const showDanmakuStateTip = (state: PlayerAgentDanmakuSwitchState) => {
  const { text, icon } = danmakuStateTips[state]
  return showPlayerTip(text, icon)
}

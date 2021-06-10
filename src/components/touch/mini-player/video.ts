import { select } from '@/core/spin-query'
import { addStyle, removeStyle } from '@/core/style'
import miniPlayerStyle from './mini-player.scss'

export const touchVideoMiniPlayer = async (enable: boolean) => {
  const player = await select('#bofqi') as HTMLDivElement
  if (!player) {
    console.warn('mini player touch move: player not found')
    return
  }
  const { enableTouchMove, disableTouchMove } = await import('../touch-move')
  const id = 'touch-mini-player'
  if (enable) {
    addStyle(miniPlayerStyle, id)
    enableTouchMove(player, {
      minMoveDistance: 0,
    })
  } else {
    removeStyle(id)
    disableTouchMove(player)
  }
}

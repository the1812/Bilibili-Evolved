import { select } from '@/core/spin-query'

export const touchLiveMiniPlayer = async (enable: boolean) => {
  const player = (await select('.live-player-ctnr')) as HTMLDivElement
  if (!player) {
    console.warn('mini player touch move: player not found')
    return
  }
  const { enableTouchMove, disableTouchMove } = await import('./touch-move')
  if (enable) {
    enableTouchMove(player, {
      minMoveDistance: 10,
    })
  } else {
    disableTouchMove(player)
  }
}

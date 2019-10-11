const load = async (enable = true) => {
  if (![
    '//www.bilibili.com/bangumi/play/',
    '//www.bilibili.com/video/'
  ].some(it => document.URL.includes(it))) {
    return
  }
  const player = await SpinQuery.select('#bofqi')
  if (!player) {
    console.warn('mini player touch move: player not found')
    return
  }
  const { enableTouchMove, disableTouchMove } = await import('../touch-move')
  if (enable) {
    resources.applyStyle('miniPlayerTouchMoveStyle')
    enableTouchMove(player)
  } else {
    resources.removeStyle('miniPlayerTouchMoveStyle')
    disableTouchMove(player)
  }
}
load()
export default {
  reload: load,
  unload: () => load(false),
}

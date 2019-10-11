(async () => {
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
  resources.applyStyle('miniPlayerTouchMoveStyle')
  const { enableTouchMove } = await import('../touch-move')
  enableTouchMove(player)
})()

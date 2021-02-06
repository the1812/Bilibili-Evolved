const style = `
  #bilibiliPlayer,
  #bilibili-player.mini-player:before
  {
    box-shadow: 0px 2px 8px 0px var(--theme-color-30) !important;
  }
  body.dark #bilibiliPlayer,
  body.dark #bilibili-player.mini-player::before
  {
    box-shadow: 0px 2px 8px 0px var(--theme-color-20) !important;
  }
`.trim()
export default resources.toggleStyle(style, 'player-shadow-style')

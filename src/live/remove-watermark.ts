const id = 'remove-live-watermark'
const style = `
  .live-player-ctnr .web-player-icon-roomStatus,
  .bilibili-live-player-video-logo
  {
    display: none !important;
  }
`.trim()
export default resources.toggleStyle(style, id)

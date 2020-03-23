const id = 'remove-live-watermark'
const style = `
.bilibili-live-player-video-logo
{
  display: none !important;
}
`
export default resources.toggleStyle(style, id)

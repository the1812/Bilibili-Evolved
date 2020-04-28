const style = `
.v-wrap .l-con,
.v-wrap .r-con {
  display: flex;
  flex-direction: column;
}
.v-wrap .l-con .player-wrap,
.v-wrap .r-con .danmaku-box {
  order: -1;
}
.v-wrap .l-con .video-info {
  margin: 16px 0 0 0 !important;
}
.video-info .video-data .argue,
.video-info .video-data .copyright {
  overflow: hidden;
  text-overflow: ellipsis;
}
`
const id = 'player-on-top-style'
export default resources.toggleStyle(style, id, {
  include: [
    /^https:\/\/www\.bilibili\.com\/video\//
  ]
})

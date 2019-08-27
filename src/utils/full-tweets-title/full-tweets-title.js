const style = `
.dynamic-m .info {
  height: auto !important;
}
.dynamic-m .info a {
  white-space: normal !important;
}
.custom-navbar .video-activity-card .title {
  display: block !important;
  max-height: unset !important;
}
.custom-navbar .video-activity-card .cover {
  height: unset !important;
}
`
export default resources.toggleStyle(style, 'full-tweets-title')

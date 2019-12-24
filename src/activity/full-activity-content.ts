const style = `
.card .main-content .expand-btn,
.card .main-content .content-ellipsis {
  display: none !important;
}
.card .main-content .content-full{
  display: block !important;
  height: auto !important;
}
`
export default resources.toggleStyle(style, 'full-activity-content')

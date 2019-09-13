const style = `
.card-list .card .expand-btn,
.card-list .card .content-ellipsis {
  display: none !important;
}
.card-list .card .content-full {
  display: block !important;
}
`
export default resources.toggleStyle(style, 'full-activity-content')

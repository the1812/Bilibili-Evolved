const style = `
.card-list .card .expand-btn,
.detail-card .card .expand-btn,
.card-list .card .content-ellipsis,
.detail-card .card .content-ellipsis {
  display: none !important;
}
.detail-card .card .content-full,
.card-list .card .content-full {
  display: block !important;
}
`
export default resources.toggleStyle(style, 'full-activity-content')

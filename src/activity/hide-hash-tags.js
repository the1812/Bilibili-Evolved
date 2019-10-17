if (document.URL.replace(location.search, '') !== 'https://t.bilibili.com/') {
  return
}
const style = `.left-panel .tag-panel,.right-panel .tag-panel{display: none !important}`
const id = 'hideHashTagsStyle'
export default resources.toggleStyle(style, id)

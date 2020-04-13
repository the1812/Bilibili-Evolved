const removeBadScrollbar = () => {
  SpinQuery.select('.custom-scrollbar').then(it => it && it.classList.remove('custom-scrollbar'))
}
const unload = () => {
  document.body.classList.remove('dark')
  resources.removeStyle('scrollbarStyle')
  resources.removeStyle('darkStyleNavBar')
  resources.removeStyle('darkStyle')
  resources.removeStyle('darkStyleImportant')
}
const notSupported = [
  /^https:\/\/member\.bilibili\.com\/v2/,
  /^https:\/\/member\.bilibili\.com\/video\/upload.html/,
  /^https:\/\/member\.bilibili\.com\/article-text\/home[\/]?/,
  /^https:\/\/www\.bilibili\.com\/audio\/submit[\/]?/,
]
const load = () => {
  if (settings.noDarkOnMember && notSupported.some(it => {
    if (typeof it === 'string') {
      return document.URL.replace(location.search, '') === it
    } else {
      return it.test(document.URL.replace(location.search, ''))
    }
  })) {
    unload()
    return
  }
  document.body.classList.add('dark')
  removeBadScrollbar()
  if (!settings.useDarkStyleAsUserStyle) {
    resources.applyStyle('scrollbarStyle')
    resources.applyImportantStyle('darkStyleNavBar')
    resources.applyStyle('darkStyle')
    resources.applyImportantStyle('darkStyleImportant')
  }
}
load()
addSettingsListener('useDarkStyleAsUserStyle', value => {
  unload()
  load()
})
export default {
  reload: load,
  unload: unload,
}

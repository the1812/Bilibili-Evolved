const removeBadScrollbar = () => {
  SpinQuery.select('.custom-scrollbar').then(it => it && it.classList.remove('custom-scrollbar'))
}
const unload = () => {
  document.body.classList.remove('dark')
  resources.removeStyle('darkStyleNavBar')
  resources.removeStyle('darkStyle')
  resources.removeStyle('darkStyleImportant')
}
const notSupported = [
  '//member.bilibili.com/v2',
  '//member.bilibili.com/video/upload.html',
  '//member.bilibili.com/article-text/home',
  '//www.bilibili.com/audio/submit/',
  '//member.bilibili.com/studio/bs-editor/projects',
]
const load = () => {
  if (settings.noDarkOnMember && notSupported.some(it => {
    if (typeof it === 'string') {
      return document.URL.replace(location.search, '').includes(it)
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
    resources.applyImportantStyle('darkStyleNavBar')
    resources.applyStyle('darkStyle')
    resources.applyImportantStyle('darkStyleImportant')
  }
}
load()
addSettingsListener('useDarkStyleAsUserStyle', () => {
  unload()
  load()
})
export default {
  reload: load,
  unload: unload,
}

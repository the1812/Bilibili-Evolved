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
const load = () => {
  if (settings.noDarkOnMember && document.URL.startsWith('https://member.bilibili.com/v2')) {
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

const removeBadScrollbar = () => {
  SpinQuery.select('.custom-scrollbar').then(it => it && it.classList.remove('custom-scrollbar'))
}
const load = () => {
  document.body.classList.add('dark')
  removeBadScrollbar()
  resources.applyStyle('scrollbarStyle')
  resources.applyImportantStyle('darkStyleNavBar')
  resources.applyStyle('darkStyle')
  resources.applyImportantStyle('darkStyleImportant')
}
load()
export default {
  reload: load,
  unload: () => {
    document.body.classList.remove('dark')
    resources.removeStyle('scrollbarStyle')
    resources.removeStyle('darkStyleNavBar')
    resources.removeStyle('darkStyle')
    resources.removeStyle('darkStyleImportant')
  }
}

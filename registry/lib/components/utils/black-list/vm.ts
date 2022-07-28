import { mountVueComponent } from '@/core/utils'
import { getData } from '@/plugins/data'
import { BlockListDataKey } from './common'

type SettingsVmType = Vue & {
  toggle: () => void
  triggerElement: HTMLElement
  list : string[]
  save : (items:string[]) => void
  titleName: string
}
let nameSettingsVM: SettingsVmType
let regexSettingsVm: SettingsVmType
export const setNameProps = (element: HTMLElement) => {
  if (!nameSettingsVM) {
    return
  }
  nameSettingsVM.triggerElement = element
  const blockList = getData(BlockListDataKey)
  nameSettingsVM.list = blockList[0].up
  nameSettingsVM.save = (items:string[]) => {
    blockList[0].up = items
    GM_setValue(BlockListDataKey, blockList[0])
  }
  nameSettingsVM.titleName = '精确匹配'
}
export const setRegexProps = (element: HTMLElement) => {
  if (!regexSettingsVm) {
    return
  }
  regexSettingsVm.triggerElement = element
  const blockList = getData(BlockListDataKey)
  regexSettingsVm.list = blockList[0].upRegex
  regexSettingsVm.save = (items:string[]) => {
    blockList[0].upRegex = items
    GM_setValue(BlockListDataKey, blockList[0])
  }
  regexSettingsVm.titleName = '正则匹配'
}

export const loadNameSettings = async () => {
  if (nameSettingsVM) {
    return false
  }
  const NavbarSettings = await import('./NavbarSettings.vue').then(m => m.default)
  nameSettingsVM = mountVueComponent(NavbarSettings)
  document.body.insertAdjacentElement('beforeend', nameSettingsVM.$el)
  return true
}

export const loadRegexSettings = async () => {
  if (regexSettingsVm) {
    return false
  }
  const NavbarSettings = await import('./NavbarSettings.vue').then(m => m.default)
  regexSettingsVm = mountVueComponent(NavbarSettings)
  document.body.insertAdjacentElement('beforeend', regexSettingsVm.$el)
  return true
}
export const toggleNameSettings = async () => {
  if (!nameSettingsVM) {
    await loadNameSettings()
  }
  nameSettingsVM?.toggle()
}

export const toggleRegexSettings = async () => {
  if (!regexSettingsVm) {
    await loadRegexSettings()
  }
  regexSettingsVm?.toggle()
}

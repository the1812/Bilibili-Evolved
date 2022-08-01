import { getComponentSettings } from '@/core/settings'
import { mountVueComponent } from '@/core/utils'
import { addData, getData } from '@/plugins/data'
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

const blackListOptions = getComponentSettings('blackList').options as {
  up: string[]
  upRegex: string[]
}

export const setNameProps = (element: HTMLElement) => {
  if (!nameSettingsVM) {
    return
  }
  nameSettingsVM.triggerElement = element
  const blockList = getData(BlockListDataKey)
  nameSettingsVM.list = lodash.cloneDeep(blockList[0].up)
  nameSettingsVM.save = (items:string[]) => {
    addData(BlockListDataKey, data => {
      data.up = items
    })
    blackListOptions.up = items
  }
  nameSettingsVM.titleName = '精确匹配'
}
export const setRegexProps = (element: HTMLElement) => {
  if (!regexSettingsVm) {
    return
  }
  regexSettingsVm.triggerElement = element
  const blockList = getData(BlockListDataKey)
  regexSettingsVm.list = lodash.cloneDeep(blockList[0].upRegex)
  regexSettingsVm.save = (items:string[]) => {
    addData(BlockListDataKey, data => {
      data.upRegex = items
    })
    blackListOptions.upRegex = items
  }
  regexSettingsVm.titleName = '正则匹配'
}

export const loadNameSettings = async () => {
  if (nameSettingsVM) {
    return false
  }
  const blockListSettings = await import('./BlockListSettings.vue').then(m => m.default)
  nameSettingsVM = mountVueComponent(blockListSettings)
  document.body.insertAdjacentElement('beforeend', nameSettingsVM.$el)
  return true
}

export const loadRegexSettings = async () => {
  if (regexSettingsVm) {
    return false
  }
  const blockListSettings = await import('./BlockListSettings.vue').then(m => m.default)
  regexSettingsVm = mountVueComponent(blockListSettings)
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

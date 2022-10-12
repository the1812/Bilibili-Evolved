import { getComponentSettings } from '@/core/settings'
import { mountVueComponent } from '@/core/utils'
import { addData, getData } from '@/plugins/data'
import { BlackListDataKey } from './common'

type SettingsVmType = Vue & {
  toggle: () => void
  triggerElement: HTMLElement
  list: string[]
  save: (items: string[]) => void
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
  const blackList = getData(BlackListDataKey)
  nameSettingsVM.list = lodash.cloneDeep(blackList[0].up)
  nameSettingsVM.save = (items: string[]) => {
    addData(BlackListDataKey, data => {
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
  const blackList = getData(BlackListDataKey)
  regexSettingsVm.list = lodash.cloneDeep(blackList[0].upRegex)
  regexSettingsVm.save = (items: string[]) => {
    addData(BlackListDataKey, data => {
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
  const blackListSettings = await import('./BlackListSettings.vue').then(m => m.default)
  nameSettingsVM = mountVueComponent(blackListSettings)
  document.body.insertAdjacentElement('beforeend', nameSettingsVM.$el)
  return true
}

export const loadRegexSettings = async () => {
  if (regexSettingsVm) {
    return false
  }
  const blackListSettings = await import('./BlackListSettings.vue').then(m => m.default)
  regexSettingsVm = mountVueComponent(blackListSettings)
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

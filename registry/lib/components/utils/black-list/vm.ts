import { getComponentSettings } from '@/core/settings'
import { mountVueComponent } from '@/core/utils'
import { addData, getData } from '@/plugins/data'

import { BlackListDataKey } from './common'
import type BlackListSettings from './BlackListSettings.vue'

type SettingsVmType = InstanceType<typeof BlackListSettings>
let nameSettingsVM: SettingsVmType | undefined
let regexSettingsVm: SettingsVmType | undefined

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
  const [el, vm] = mountVueComponent(await import('./BlackListSettings.vue'))
  nameSettingsVM = vm
  document.body.insertAdjacentElement('beforeend', el)
  return true
}

export const loadRegexSettings = async () => {
  if (regexSettingsVm) {
    return false
  }
  const [el, vm] = mountVueComponent(await import('./BlackListSettings.vue'))
  regexSettingsVm = vm
  document.body.insertAdjacentElement('beforeend', el)
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

import { select } from '@/core/spin-query'
import { mountVueComponent } from '@/core/utils'
import { getData } from '@/plugins/data'

export const BlackListDataKey = 'like-black-List.data'

type SettingsVmType = Vue & {
  toggle: () => void
  triggerElement: HTMLElement
  list: string[]
  titleName: string
}
let blacklistVM: SettingsVmType = null

export const setBlackListProps = (element: HTMLElement) => {
  if (!blacklistVM) {
    return
  }
  blacklistVM.triggerElement = element
  const blackList = getData(BlackListDataKey)
  blacklistVM.list = blackList[0].users
  blacklistVM.titleName = '黑名单'
}
export const loadlikeButton = async () => {
  const LikeButton = await import('./like.vue').then(m => m.default)
  const blackList = getData(BlackListDataKey)
  const likebuttonVM: Vue & { list: string[] } = mountVueComponent(LikeButton)
  likebuttonVM.list = blackList[0].users
  const bg = (await select('#app')) as HTMLElement
  bg.insertAdjacentElement('afterbegin', likebuttonVM.$el)
}

export const loadBlackList = async () => {
  if (blacklistVM) {
    return false
  }
  const blackList = await import('./blackList.vue').then(m => m.default)
  blacklistVM = mountVueComponent(blackList)
  document.body.insertAdjacentElement('beforeend', blacklistVM.$el)
  return true
}

export const toggleBlackList = async () => {
  if (!blacklistVM) {
    await loadBlackList()
  }
  blacklistVM?.toggle()
}

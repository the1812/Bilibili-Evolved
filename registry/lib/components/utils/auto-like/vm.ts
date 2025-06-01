import { select } from '@/core/spin-query'
import { mountVueComponent } from '@/core/utils'
import { getData } from '@/plugins/data'

import type blackListVue from './blackList.vue'

export const BlackListDataKey = 'like-black-List.data'
let blacklistVM: InstanceType<typeof blackListVue> | null = null

export const loadlikeButton = async () => {
  const LikeButton = await import('./like.vue')
  const [el] = mountVueComponent(LikeButton)
  const bg = (await select('#app')) as HTMLElement
  bg.insertAdjacentElement('afterbegin', el)
}

export const loadBlackList = async (element: HTMLElement) => {
  if (blacklistVM) {
    return
  }
  const blackList = await import('./blackList.vue')
  const [el, vm] = mountVueComponent(blackList, {
    triggerElement: element,
    list: getData(BlackListDataKey)[0].users,
    titleName: '黑名单',
  })
  blacklistVM = vm
  document.body.insertAdjacentElement('beforeend', el)
}

export const toggleBlackList = async () => {
  if (blacklistVM) {
    blacklistVM.isOpen = false
  }
}

import { TestPattern } from '@/core/common-types'
import { childList, childListSubtree } from '@/core/observer'
import { select } from '@/core/spin-query'
import { liveUrls } from '@/core/utils/urls'
import { addData } from '@/plugins/data'
import { FeedsCardsManager } from './base'

/** 表示一个动态卡片列表适配器, 可以对在不同页面的地方里的动态列表提供支持 */
export interface FeedsCardsListAdaptor {
  /** 名称 */
  name: string
  /** 匹配的网址 */
  match: TestPattern
  /**
   * 开始监测
   * @param manager `FeedsCardsManager` 的实例
   * @returns 是否监测成功
   */
  watchCardsList: (manager: FeedsCardsManager) => Promise<boolean>
}
export const ListAdaptorKey = 'feeds.manager.listAdaptors'
addData(ListAdaptorKey, (adaptors: FeedsCardsListAdaptor[]) => {
  adaptors.push(
    {
      name: 'live',
      match: [...liveUrls],
      watchCardsList: async manager => {
        const feedsContainer = (await select('.room-feed')) as HTMLElement
        if (!feedsContainer) {
          return false
        }
        console.log('live watch')
        let cardListObserver: MutationObserver | null = null
        childList(feedsContainer, async () => {
          if (dq('.room-feed-content')) {
            const cardsList = (await select('.room-feed-content .content')) as HTMLElement
            cardListObserver?.disconnect()
            ;[cardListObserver] = manager.updateCards(cardsList)
          } else {
            cardListObserver?.disconnect()
            cardListObserver = null
            await Promise.all(manager.cards.map(c => c.element).map(e => manager.removeCard(e)))
          }
        })
        return true
      },
    },
    {
      name: 'space',
      match: ['https://space.bilibili.com/'],
      watchCardsList: async manager => {
        const container = (await select('.s-space')) as HTMLDivElement
        if (!container) {
          return false
        }
        const vm: {
          observer?: Promise<MutationObserver>
          listElement?: Promise<HTMLElement | null>
        } = {}
        const stop = () => {
          if (!vm.listElement || !vm.observer) {
            return
          }
          console.log('space feeds stop')
          vm.observer?.then(it => it.disconnect())
          delete vm.observer
          delete vm.listElement
          manager.cleanUpCards()
        }
        const start = () => {
          if (vm.observer) {
            return vm.observer
          }
          const newListPromise = select('.bili-dyn-list__items') as Promise<HTMLElement>
          vm.observer = (async () => {
            const newList = await newListPromise
            if (newList !== (await vm.listElement)) {
              if (vm.listElement) {
                stop()
              }
              vm.listElement = newListPromise
              start()
            }
            console.log('space feeds start')
            const [cardListObserver] = manager.updateCards(newList)
            return cardListObserver
          })()
          return vm.observer
        }
        childListSubtree(container, async () => {
          if (dq('.bili-dyn-list__items')) {
            start()
          } else {
            stop()
          }
        })
        return true
      },
    },
    {
      name: 'topic',
      match: ['https://t.bilibili.com/topic'],
      watchCardsList: async manager => {
        const feedsContainer = (await select('.page-container')) as HTMLElement
        if (!feedsContainer) {
          return false
        }
        let cardListObserver: MutationObserver | null = null
        childList(feedsContainer, async () => {
          if (dq('.page-container .feed')) {
            const cardsList = (await select('.feed .feed-topic')) as HTMLElement
            cardListObserver?.disconnect()
            ;[cardListObserver] = manager.updateCards(cardsList)
          } else {
            cardListObserver?.disconnect()
            cardListObserver = null
            await Promise.all(manager.cards.map(c => c.element).map(e => manager.removeCard(e)))
          }
        })
        return true
      },
    },
    {
      name: 'opus-detail',
      match: ['https://www.bilibili.com/opus/'],
      watchCardsList: async manager => {
        const opusContainer = (await select('.opus-detail')) as HTMLElement
        if (!opusContainer) {
          return false
        }
        manager.updateCards(opusContainer)
        return true
      },
    },
    {
      name: 'default',
      match: ['https://t.bilibili.com/'],
      watchCardsList: async manager => {
        const list = (await select(
          '.feed-card .content, .detail-content .detail-card, #app > .content > .card, .bili-dyn-list__items',
        )) as HTMLElement
        if (!list) {
          return false
        }
        if (list.classList.contains('bili-dyn-list__items')) {
          const section = list.parentElement.parentElement
          let cardListObserver: MutationObserver
          childList(section, () => {
            const changedList = dq(section, '.bili-dyn-list__items') as HTMLElement
            if (!changedList) {
              return
            }
            cardListObserver?.disconnect()
            manager.cards = []
            ;[cardListObserver] = manager.updateCards(changedList)
          })
        } else {
          manager.updateCards(list)
        }
        return true
      },
    },
  )
})

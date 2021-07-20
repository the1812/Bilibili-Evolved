/* eslint-disable no-underscore-dangle */
import { TestPattern } from '@/core/common-types'
import { childList } from '@/core/observer'
import { sq, select } from '@/core/spin-query'
import { matchUrlPattern } from '@/core/utils'
import { liveUrls } from '@/core/utils/urls'
import { addData, registerAndGetData } from '@/plugins/data'
import {
  feedsCardTypes,
  FeedsCard,
  RepostFeedsCard,
  FeedsCardType,
  FeedsCardCallback,
} from './types'

const getFeedsCardType = (element: HTMLElement) => {
  if (element.querySelector('.repost')) {
    return feedsCardTypes.repost
  }
  if (element.querySelector('.imagesbox')) {
    return feedsCardTypes.textWithImages
  }
  if (element.querySelector('.video-container')) {
    return feedsCardTypes.video
  }
  if (element.querySelector('.bangumi-container')) {
    return feedsCardTypes.bangumi
  }
  if (element.querySelector('.article-container')) {
    return feedsCardTypes.column
  }
  if (element.querySelector('.music-container')) {
    return feedsCardTypes.audio
  }
  if (element.querySelector('.h5share-container')) {
    return feedsCardTypes.share
  }
  if (element.querySelector('.vc-ctnr')) {
    return feedsCardTypes.miniVideo
  }
  if (element.querySelector('.live-container')) {
    return feedsCardTypes.liveRecord
  }
  return feedsCardTypes.text
}
const isRepostType = (card: FeedsCard): card is RepostFeedsCard => (
  card.type === feedsCardTypes.repost
)
const feedsCardCallbacks: Required<FeedsCardCallback>[] = []
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
const ListAdaptorKey = 'feeds.manager.listAdaptors'
addData(ListAdaptorKey, (adaptors: FeedsCardsListAdaptor[]) => {
  adaptors.push(
    {
      name: 'live',
      match: [
        ...liveUrls,
      ],
      watchCardsList: async manager => {
        const feedsContainer = await select('.room-feed') as HTMLElement
        if (!feedsContainer) {
          return false
        }
        console.log('live watch')
        let cardListObserver: MutationObserver | null = null
        childList(feedsContainer, async () => {
          if (dq('.room-feed-content')) {
            const cardsList = await select('.room-feed-content .content') as HTMLElement
            cardListObserver?.disconnect();
            [cardListObserver] = manager.updateCards(cardsList)
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
      match: [
        'https://space.bilibili.com/',
      ],
      watchCardsList: async manager => {
        const container = await select('.s-space') as HTMLDivElement
        if (!container) {
          return false
        }
        let cardListObserver: MutationObserver | null = null
        childList(container, async () => {
          if (dq('#page-dynamic')) {
            const cardsList = await select('.feed-card .content') as HTMLElement
            cardListObserver?.disconnect();
            [cardListObserver] = manager.updateCards(cardsList)
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
      name: 'topic',
      match: [
        'https://t.bilibili.com/topic',
      ],
      watchCardsList: async manager => {
        const feedsContainer = await select('.page-container') as HTMLElement
        if (!feedsContainer) {
          return false
        }
        let cardListObserver: MutationObserver | null = null
        childList(feedsContainer, async () => {
          if (dq('.page-container .feed')) {
            const cardsList = await select('.feed .feed-topic') as HTMLElement
            cardListObserver?.disconnect();
            [cardListObserver] = manager.updateCards(cardsList)
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
      name: 'default',
      match: [
        'https://t.bilibili.com/',
      ],
      watchCardsList: async manager => {
        const list = await select('.feed-card .content, .detail-content .detail-card') as HTMLElement
        if (!list) {
          return false
        }
        manager.updateCards(list)
        return true
      },
    },
  )
})
/** 动态卡片管理器, 封装了动态卡片的解析与监测 */
class FeedsCardsManager extends EventTarget {
  /** 是否已在监测中 */
  watching = false
  /** 监测到的动态卡片列表 */
  cards: FeedsCard[] = []
  /** 监听动态卡片的增加/移除 */
  addEventListener(
    type: 'addCard' | 'removeCard',
    listener: (event: CustomEvent<FeedsCard>) => void,
    options?: boolean | AddEventListenerOptions | undefined,
  ): void {
    super.addEventListener(type, listener, options)
  }
  /** 取消监听动态卡片的增加/移除 */
  removeEventListener(
    type: 'addCard' | 'removeCard',
    callback: (event: CustomEvent<FeedsCard>) => void,
    options?: boolean | AddEventListenerOptions | undefined,
  ): void {
    super.removeEventListener(type, callback, options)
  }
  /**
   * 根据传入元素添加动态卡片
   * @param node 动态卡片的元素
   */
  async addCard(node: Node) {
    if (!node) {
      return
    }
    if (node instanceof HTMLElement && node.classList.contains('card')) {
      if (node.querySelector('.skeleton') !== null) {
        const [observer] = childList(node, () => {
          if (node.querySelector('.skeleton') === null) {
            observer.disconnect()
            this.addCard(node)
          }
        })
      } else {
        if (node.parentNode === null) {
          // console.log('skip parse', node)
          return
        }
        const card = await FeedsCardsManager.parseCard(node)
        if (!card.presented) {
          // console.log('skip detached card:', card)
          return
        }
        if (this.cards.find(c => c.id === card.id)) {
          return
        }
        this.cards.push(card)
        this.cards.sort((a, b) => {
          if (a.id === b.id) {
            return 0
          }
          return a.id > b.id ? -1 : 1
        })
        const event = new CustomEvent('addCard', { detail: card })
        this.dispatchEvent(event)
        feedsCardCallbacks.forEach(c => c.added(card))
      }
    }
  }
  /**
   * 根据传入元素移除动态卡片
   * @param node 动态卡片的元素
   */
  async removeCard(node: Node) {
    if (!node) {
      return
    }
    if (node instanceof HTMLElement && node.classList.contains('card')) {
      const id = node.getAttribute('data-did') as string
      const index = this.cards.findIndex(c => c.id === id)
      if (index === -1) {
        return
      }
      const card = this.cards[index]
      this.cards.splice(index, 1)
      const event = new CustomEvent('removeCard', { detail: card })
      this.dispatchEvent(event)
      feedsCardCallbacks.forEach(c => c.removed(card))
    }
  }
  /**
   * 根据传入元素解析出动态卡片对象
   * @param element 动态卡片的元素
   */
  static async parseCard(element: HTMLElement): Promise<FeedsCard> {
    const getVueData = (el: any) => el.__vue__ || el.parentElement.__vue__
    const getSimpleText = async (selector: string) => {
      const subElement = await sq(
        () => element.querySelector(selector),
        it => it !== null || element.parentNode === null,
        { queryInterval: 100 },
      ) as HTMLElement
      if (element.parentNode === null) {
        // console.log('skip detached node:', element)
        return ''
      }
      if (subElement === null) {
        console.warn(element, selector, element.parentNode)
        return ''
      }
      const subElementText = subElement.innerText.trim()
      return subElementText
    }
    const getRepostData = (vueData: any) => {
      // 被转发动态已失效
      if (vueData.card.origin === undefined) {
        return {
          originalText: '',
          originalDescription: '',
          originalTitle: '',
        }
      }
      const originalCard = JSON.parse(vueData.card.origin)
      const originalText: string = vueData.originCardData.pureText
      const originalDescription: string = _.get(originalCard, 'item.description', '')
      const originalTitle: string = originalCard.title
      return {
        originalText,
        originalDescription,
        originalTitle,
      }
    }
    const getComplexText = async (type: FeedsCardType) => {
      if (type === feedsCardTypes.bangumi) {
        return ''
      }
      const el = await sq(
        () => element,
        (it: any) => Boolean(getVueData(it) || !element.parentNode),
        { queryInterval: 100 },
      )
      if (element.parentNode === null) {
        // console.log('skip detached node:', element)
        return ''
      }
      if (el === null) {
        console.warn(el, element, getVueData(el), element.parentNode)
        return ''
      }
      const vueData = getVueData(el)
      if (type === feedsCardTypes.repost) {
        const currentText = vueData.card.item.content
        const repostData = getRepostData(vueData)
        return [
          currentText,
          ...Object.values(repostData).filter(it => it !== ''),
        ].filter(it => Boolean(it)).join('\n')
      }
      const currentText = vueData.originCardData.pureText
      const currentTitle = vueData.originCardData.title
      return [
        currentText,
        currentTitle,
      ].filter(it => Boolean(it)).join('\n')
    }
    const getNumber = async (selector: string) => {
      const result = parseInt(await getSimpleText(selector))
      if (isNaN(result)) {
        return 0
      }
      return result
    }
    const card = {
      id: element.getAttribute('data-did') as string,
      username: await getSimpleText('.main-content .user-name'),
      text: '',
      reposts: await getNumber('.button-bar .single-button:nth-child(1) .text-offset'),
      comments: await getNumber('.button-bar .single-button:nth-child(2) .text-offset'),
      likes: await getNumber('.button-bar .single-button:nth-child(3) .text-offset'),
      element,
      type: getFeedsCardType(element),
      get presented() { return element.parentNode !== null },
      async getText() {
        const result = await getComplexText(this.type)
        this.text = result
        // console.log(result)
        return result
      },
    }
    await card.getText()
    element.setAttribute('data-type', card.type.id.toString())
    if (isRepostType(card)) {
      const currentUsername = card.username
      const vueData = getVueData(card.element)
      const repostUsername = _.get(vueData, 'card.origin_user.info.uname', '')
      if (currentUsername === repostUsername) {
        element.setAttribute('data-self-repost', 'true')
      }
      card.repostUsername = repostUsername
      card.repostText = getRepostData(vueData).originalText
    }
    // if (card.text === '') {
    //   console.warn('card text parsing failed!', card)
    // }
    return card
  }
  /**
   * 根据卡片列表元素更新动态卡片列表
   * @param cardsList 卡片列表元素
   */
  updateCards(cardsList: HTMLElement) {
    const selector = '.card[data-did]'
    const findCardNode = (node: Node): Node | undefined => {
      if (node instanceof HTMLElement) {
        if (node.matches(selector)) {
          return node
        }
        const child = node.querySelector(selector)
        if (child) {
          return child
        }
      }
      return undefined
    }
    const cards = [...cardsList.querySelectorAll(selector)]
    cards.forEach(it => this.addCard(it))
    return childList(cardsList, records => {
      records.forEach(record => {
        record.addedNodes.forEach(node => this.addCard(findCardNode(node)))
        record.removedNodes.forEach(node => this.removeCard(findCardNode(node)))
      })
    })
  }
  /** 对当前页面开始监测 */
  async startWatching() {
    if (this.watching) {
      return true
    }
    this.watching = true
    const [adaptors] = registerAndGetData(ListAdaptorKey, [] as FeedsCardsListAdaptor[])
    const adaptor = adaptors.find(a => a.match.some(p => matchUrlPattern(p)))
    if (!adaptor) {
      console.warn('[FeedsCardsManager] No adaptor found', adaptors)
      return false
    }
    return adaptor.watchCardsList(this)
  }
}
export const feedsCardsManager = new FeedsCardsManager()
/**
 * 为每个动态卡片执行特定操作
 * @param callback 回调函数
 */
export const forEachFeedsCard = (callback: FeedsCardCallback) => {
  (async () => {
    const success = await feedsCardsManager.startWatching()
    if (!success) {
      console.error('feedsCardsManager.startWatching() failed')
      return
    }

    const { added } = callback
    if (added) {
      feedsCardsManager.cards.forEach(c => added(c))
    }
    feedsCardCallbacks.push({ added: none, removed: none, ...callback })
  })()
}

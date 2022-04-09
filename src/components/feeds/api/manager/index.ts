import { getCookieValue } from '@/core/utils'
import { FeedsCard, FeedsCardCallback } from '../types'
import { FeedsCardsManagerV1 } from './v1'
import { FeedsCardsManagerV2 } from './v2'

const feedsCardCallbacks: Required<FeedsCardCallback>[] = []

/** 动态卡片管理器支持的自定义事件 */
export const enum FeedsCardsManagerEventType {
  /** 新增动态卡片 */
  AddCard = 'addCard',
  /** 移除动态卡片 */
  RemoveCard = 'removeCard',
}

/** 动态卡片管理器, 封装了动态卡片的解析与监测 */
export abstract class FeedsCardsManager extends EventTarget {
  /** 是否已在监测中 */
  watching = false
  /** 监测到的动态卡片列表 */
  cards: FeedsCard[] = []
  /** 监听动态卡片的增加/移除 */
  addEventListener(
    type: FeedsCardsManagerEventType,
    listener: (event: CustomEvent<FeedsCard>) => void,
    options?: boolean | AddEventListenerOptions | undefined,
  ): void {
    super.addEventListener(type, listener, options)
  }
  /** 取消监听动态卡片的增加/移除 */
  removeEventListener(
    type: FeedsCardsManagerEventType,
    callback: (event: CustomEvent<FeedsCard>) => void,
    options?: boolean | AddEventListenerOptions | undefined,
  ): void {
    super.removeEventListener(type, callback, options)
  }
  /** 触发自定义事件 */
  dispatchCardEvent(type: FeedsCardsManagerEventType, card: FeedsCard) {
    const event = new CustomEvent(type, { detail: card })
    this.dispatchEvent(event)
    feedsCardCallbacks.forEach(c => c[type === FeedsCardsManagerEventType.AddCard ? 'added' : 'removed'](card))
  }

  /**
   * 根据传入元素添加动态卡片
   * @param node 动态卡片的元素
   */
  abstract addCard(node: Node): Promise<void>
  /**
   * 根据传入元素移除动态卡片
   * @param node 动态卡片的元素
   */
  abstract removeCard(node: Node): Promise<void>
  /**
   * 根据卡片列表元素更新动态卡片列表
   * @param cardsList 卡片列表元素
   */
  abstract updateCards(cardsList: HTMLElement): readonly [MutationObserver, MutationObserverInit]
  /** 对当前页面开始监测 */
  abstract startWatching(): Promise<boolean>
}

export const feedsCardsManager = (() => {
  const isV2Feeds = parseInt(getCookieValue('hit-dyn-v2')) > 0
  if (isV2Feeds) {
    return new FeedsCardsManagerV2()
  }
  return new FeedsCardsManagerV1()
})()
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

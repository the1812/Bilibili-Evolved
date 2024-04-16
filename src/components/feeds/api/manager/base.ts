import { matchUrlPattern } from '@/core/utils'
import { registerAndGetData } from '@/plugins/data'
import { FeedsCardCallback, FeedsCard } from '../types'
import { ListAdaptorKey, FeedsCardsListAdaptor } from './adaptor'

export const feedsCardCallbacks: Required<FeedsCardCallback>[] = []

// TODO: 仅做兼容性导出, v2.8.11 之后可移除
export { getVue2Data as getVueData } from '@/core/utils'

export const createNodeValidator =
  (className: string) =>
  (node: Node): node is HTMLElement => {
    const notNull = Boolean(node)
    const notDetached = node && node.parentNode
    const matchClassName = node instanceof HTMLElement && node.matches(className)
    return notNull && notDetached && matchClassName
  }

/** 动态卡片管理器支持的自定义事件 */
export enum FeedsCardsManagerEventType {
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
    feedsCardCallbacks.forEach(c =>
      c[type === FeedsCardsManagerEventType.AddCard ? 'added' : 'removed'](card),
    )
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
  /** 清理不在 DOM 里的动态卡片 */
  cleanUpCards() {
    this.cards = this.cards.filter(c => c.presented)
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
  /** 卡片管理器的标识名称, 组件如果需要对不同版本的动态做出行为区分, 可以读取这个字段 */
  abstract readonly managerType: string
}

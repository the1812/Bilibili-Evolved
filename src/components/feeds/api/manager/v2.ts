import { childList } from '@/core/observer'
import { descendingStringSort } from '@/core/utils/sort'
import { createNodeValidator, FeedsCardsManager, FeedsCardsManagerEventType, getVueData } from './base'
import { FeedsCard, feedsCardTypes } from '../types'

/** b 站的动态卡片 type 标记 -> FeedsCard.type */
const feedsCardTypeMap = {
  DynamicTypeForward: feedsCardTypes.repost,
  DynamicTypeAv: feedsCardTypes.video,
  DynamicTypeDraw: feedsCardTypes.textWithImages,
  DynamicTypeWord: feedsCardTypes.text,
  DynamicTypePgc: feedsCardTypes.bangumi,
  DynamicTypeArticle: feedsCardTypes.column,
  DynamicTypeMusic: feedsCardTypes.audio,
}
const parseCard = async (element: HTMLElement): Promise<FeedsCard> => {
  const vueData = getVueData(element)
  const { modules, id_str, type } = vueData.data
  const { desc } = modules.module_dynamic
  const { name } = modules.module_author
  const { like, forward, comment } = modules.module_stat
  return {
    id: id_str,
    username: name,
    likes: like.count,
    reposts: forward.count,
    comments: comment.count,
    text: desc.text,
    type: feedsCardTypeMap[lodash.startCase(type)] ?? feedsCardTypeMap.DynamicTypeWord,
    element,
    get presented() { return element.parentNode !== null },
    async getText() {
      return getVueData(element).data.modules.module_dynamic.desc.text
    },
  }
}
const isNodeValid = createNodeValidator('bili-dyn-item')

/** 新版动态卡片管理器实现 */
export class FeedsCardsManagerV2 extends FeedsCardsManager {
  async addCard(node: Node) {
    if (!isNodeValid(node)) {
      return
    }
    const card = await parseCard(node)
    if (!card.presented) {
      return
    }
    this.cards.push(card)
    this.cards.sort(descendingStringSort(c => c.id))
    this.dispatchCardEvent(FeedsCardsManagerEventType.AddCard, card)
  }
  async removeCard(node: Node) {
    if (!isNodeValid(node)) {
      return
    }
    const vueData = getVueData(node)
    const id = vueData.data?.id_str ?? '0'
    const index = this.cards.findIndex(c => c.id === id)
    if (index === -1) {
      return
    }
    const [card] = this.cards.splice(index, 1)
    this.dispatchCardEvent(FeedsCardsManagerEventType.RemoveCard, card)
  }
  updateCards(cardsList: HTMLElement) {
    const selector = '.bili-dyn-item'
    const cards = dqa(cardsList, selector)
    cards.forEach(it => this.addCard(it))
    return childList(cardsList, records => {
      records.forEach(record => {
        record.addedNodes.forEach(node => this.addCard(node))
        record.removedNodes.forEach(node => this.removeCard(node))
      })
    })
  }
}

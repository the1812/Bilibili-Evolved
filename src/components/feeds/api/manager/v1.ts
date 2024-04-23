import { childList } from '@/core/observer'
import { getVue2Data } from '@/core/utils'
import { sq } from '@/core/spin-query'
import { FeedsCardsManager, FeedsCardsManagerEventType } from './base'
import { feedsCardTypes, isRepostType, FeedsCard, FeedsCardType } from '../types'

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

/**
 * 根据传入元素解析出动态卡片对象
 * @param element 动态卡片的元素
 */
const parseCard = async (element: HTMLElement): Promise<FeedsCard> => {
  const getSimpleText = async (selector: string) => {
    const subElement = (await sq(
      () => element.querySelector(selector),
      it => it !== null || element.parentNode === null,
      { queryInterval: 100 },
    )) as HTMLElement
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
    const originalDescription: string = lodash.get(
      originalCard,
      'item.description',
      lodash.get(originalCard, 'desc', ''),
    )
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
      (it: any) => Boolean(getVue2Data(it) || !element.parentNode),
      { queryInterval: 100 },
    )
    if (element.parentNode === null) {
      // console.log('skip detached node:', element)
      return ''
    }
    if (el === null) {
      console.warn(el, element, getVue2Data(el), element.parentNode)
      return ''
    }
    const vueData = getVue2Data(el)
    if (type === feedsCardTypes.repost) {
      const currentText = vueData.card.item.content
      const repostData = getRepostData(vueData)
      return [currentText, ...Object.values(repostData).filter(it => it !== '')]
        .filter(it => Boolean(it))
        .join('\n')
    }
    const currentText = vueData.originCardData.pureText
    const currentTitle = vueData.originCardData.title
    return [currentText, currentTitle].filter(it => Boolean(it)).join('\n')
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
    get presented() {
      return element.parentNode !== null
    },
    async getText() {
      return getComplexText(this.type)
    },
  }
  card.text = await card.getText()
  element.setAttribute('data-type', card.type.id.toString())
  if (isRepostType(card)) {
    const currentUsername = card.username
    const vueData = getVue2Data(card.element)
    const repostUsername = lodash.get(vueData, 'card.origin_user.info.uname', '')
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

/** 旧版动态卡片管理器实现 */
export class FeedsCardsManagerV1 extends FeedsCardsManager {
  readonly managerType = 'v1'
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
        const card = await parseCard(node)
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
        this.dispatchCardEvent(FeedsCardsManagerEventType.AddCard, card)
      }
    }
  }
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
      this.dispatchCardEvent(FeedsCardsManagerEventType.RemoveCard, card)
    }
  }
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
}

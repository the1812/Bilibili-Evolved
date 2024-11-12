import { childList } from '@/core/observer'
import { descendingStringSort } from '@/core/utils/sort'
import { pascalCase, getVue2Data } from '@/core/utils'
import { createNodeValidator, FeedsCardsManager, FeedsCardsManagerEventType } from './base'
import { FeedsCard, FeedsCardType, feedsCardTypes, isRepostType } from '../types'
import { selectAll } from '@/core/spin-query'

/** b 站的动态卡片 type 标记 -> FeedsCard.type */
const feedsCardTypeMap = {
  DynamicTypeForward: feedsCardTypes.repost,
  DynamicTypeAv: feedsCardTypes.video,
  DynamicTypeDraw: feedsCardTypes.textWithImages,
  DynamicTypeWord: feedsCardTypes.text,
  DynamicTypePgc: feedsCardTypes.bangumi,
  DynamicTypeArticle: feedsCardTypes.column,
  DynamicTypeMusic: feedsCardTypes.audio,
  DynamicTypeLiveRcmd: feedsCardTypes.liveRecord,
}

const combineText = (...texts: string[]) =>
  texts
    .filter(it => Boolean(it))
    .join('\n')
    .trim()
const getType = (rawType: string): FeedsCardType =>
  feedsCardTypeMap[pascalCase(rawType)] ?? feedsCardTypeMap.DynamicTypeWord
const getText = (dynamicModule: any, cardType: FeedsCardType) => {
  const isOpusModule = Object.hasOwn(dynamicModule, 'paragraphs')
  if (isOpusModule) {
    const paragraphs = dynamicModule.paragraphs as any[]
    const textParagraph = paragraphs.find(it => it.para_type === 1)
    const text = (textParagraph.text.nodes as any[])
      .map(node => {
        if (node.type === 'TEXT_NODE_TYPE_WORD') {
          return lodash.get(node, 'word.words')
        }
        if (node.type === 'TEXT_NODE_TYPE_RICH') {
          return lodash.get(node, 'rich.orig_text')
        }
        return ''
      })
      .join('')
    return text
  }
  const { desc: mainDesc, major } = dynamicModule
  const mainText = (() => {
    if (major?.opus) {
      return lodash.get(major.opus, 'summary.text')
    }
    return mainDesc?.text ?? ''
  })()
  const typeText = (() => {
    switch (cardType) {
      default: {
        return ''
      }
      case feedsCardTypes.bangumi:
      case feedsCardTypes.column:
      case feedsCardTypes.video: {
        const target = major.archive ?? major.pgc ?? major.article
        if (target) {
          const { title, desc } = target
          return combineText(title, desc)
        }
        if (major.opus) {
          const { title, summary } = major.opus
          return combineText(title, summary.text)
        }
        return ''
      }
    }
  })()
  return combineText(mainText, typeText)
}
const parseCard = async (element: HTMLElement): Promise<FeedsCard> => {
  const vueData = getVue2Data(element)
  const parseModules = (rawModules: any) => {
    if (Array.isArray(rawModules)) {
      return Object.fromEntries(
        rawModules.map(it => {
          const [key] = Object.keys(it).filter(k => k !== 'module_type')
          if (key === 'module_content') {
            return ['module_dynamic', it[key]]
          }
          return [key, it[key]]
        }),
      )
    }
    return rawModules
  }
  const { modules: rawModules, id_str, type } = vueData.data
  const modules = parseModules(rawModules)
  const { name } = modules.module_author
  const { like, forward, comment } = modules.module_stat
  const cardType = getType(type)
  element.dataset.type = cardType.id.toString()
  const card = {
    id: id_str,
    username: name,
    likes: like.count,
    reposts: forward.count,
    comments: comment.count,
    text: '',
    type: cardType,
    element,
    get presented() {
      return document.body.contains(element)
    },
    async getText() {
      return getText(modules.module_dynamic, cardType)
    },
  }
  if (isRepostType(card)) {
    const currentUsername = card.username
    const {
      module_author: { name: repostUsername },
      module_dynamic: repostDynamicModule,
    } = parseModules(vueData.data.orig.modules)
    const repostCardType = getType(vueData.data.orig.type)
    card.repostUsername = repostUsername
    card.repostText = getText(repostDynamicModule, repostCardType)
    if (repostUsername === currentUsername) {
      element.setAttribute('data-self-repost', 'true')
    }
    card.getText = async () =>
      combineText(getText(modules.module_dynamic, cardType), getText(repostDynamicModule, cardType))
    card.repostId = vueData.data.orig.id_str
  }
  card.text = await card.getText()
  card.element.setAttribute('data-did', card.id)
  // 等待第一次 Vue 渲染完成
  await selectAll(() => element.querySelectorAll('.bili-dyn-item *'), { queryInterval: 50 })
  return card
}
const isNodeValid = createNodeValidator('.bili-dyn-list__item, .bili-dyn-item, .bili-opus-view')

/** 新版动态卡片管理器实现 */
export class FeedsCardsManagerV2 extends FeedsCardsManager {
  readonly managerType = 'v2'
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
    const vueData = getVue2Data(node)
    if (!vueData) {
      return
    }
    const id = vueData.data?.id_str ?? '0'
    const index = this.cards.findIndex(c => c.id === id)
    if (index === -1) {
      return
    }
    const [card] = this.cards.splice(index, 1)
    this.dispatchCardEvent(FeedsCardsManagerEventType.RemoveCard, card)
  }
  updateCards(cardsList: HTMLElement) {
    const selector =
      '.bili-dyn-list__item, :not(.bili-dyn-list__item) > .bili-dyn-item, .bili-opus-view'
    const cards = dqa(cardsList, selector)
    cards.forEach(it => this.addCard(it))
    const getCardNode = (node: Node) => {
      if (!isNodeValid(node)) {
        return null
      }
      if (node.matches(selector)) {
        return node as HTMLElement
      }
      return node.querySelector(selector) as HTMLElement
    }
    return childList(cardsList, records => {
      records.forEach(record => {
        record.addedNodes.forEach(node => this.addCard(getCardNode(node)))
        record.removedNodes.forEach(node => this.removeCard(getCardNode(node)))
      })
      this.cleanUpCards()
    })
  }
}

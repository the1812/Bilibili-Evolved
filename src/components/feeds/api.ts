import { childList } from '@/core/observer'
import { sq, select } from '@/core/spin-query'
import { getUID, dq, none } from '@/core/utils'
import { getJsonWithCredentials } from '@/core/ajax'
import { formatCount, formatDuration } from '@/core/utils/formatters'
import { watchlaterList } from '@/core/watchlater'
import { descendingStringSort } from '@/core/utils/sort'
import { VideoCard } from './video-card'

/* eslint-disable */
export interface FeedsCardType {
  id: number
  name: string
}
export const feedsCardTypes = {
  repost: {
    id: 1,
    name: '转发',
  } as FeedsCardType,
  textWithImages: {
    id: 2,
    name: '图文',
  } as FeedsCardType,
  text: {
    id: 4,
    name: '文字',
  } as FeedsCardType,
  video: {
    id: 8,
    name: '视频',
  } as FeedsCardType,
  miniVideo: {
    id: 16,
    name: '小视频',
  } as FeedsCardType,
  column: {
    id: 64,
    name: '专栏',
  } as FeedsCardType,
  audio: {
    id: 256,
    name: '音频',
  } as FeedsCardType,
  bangumi: {
    id: 512,
    name: '番剧',
  } as FeedsCardType,
  share: {
    id: 2048,
    name: '分享',
  } as FeedsCardType,
  manga: {
    id: 2049,
    name: '漫画',
  } as FeedsCardType,
  film: {
    id: 4098,
    name: '电影',
  } as FeedsCardType,
  tv: {
    id: 4099,
    name: 'TV剧',
  } as FeedsCardType,
  chinese: {
    id: 4100,
    name: '国创',
  } as FeedsCardType,
  documentary: {
    id: 4101,
    name: '纪录片',
  } as FeedsCardType,
  mediaList: {
    id: 4300,
    name: '收藏夹',
  } as FeedsCardType,
}
export const bangumiTypeList = '512,4097,4098,4099,4100,4101'
export const navbarFeedsTypeList = '8,64,512,4097,4098,4099,4100,4101'
export interface FeedsCard {
  id: string
  username: string
  text: string
  reposts: number
  comments: number
  likes: number
  element: HTMLElement
  type: FeedsCardType
  presented: boolean
  getText: () => Promise<string>
}
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
  return feedsCardTypes.text
}

export type FeedsCardCallback = {
  added?: (card: FeedsCard) => void
  removed?: (card: FeedsCard) => void
}
const feedsCardCallbacks: Required<FeedsCardCallback>[] = []
class FeedsCardsManager extends EventTarget {
  watching = false
  cards: FeedsCard[] = []
  addEventListener(
    type: 'addCard' | 'removeCard',
    listener: (event: CustomEvent<FeedsCard>) => void,
    options?: boolean | AddEventListenerOptions | undefined,
  ): void {
    super.addEventListener(type, listener, options)
  }
  removeEventListener(
    type: 'addCard' | 'removeCard',
    callback: (event: CustomEvent<FeedsCard>) => void,
    options?: boolean | AddEventListenerOptions | undefined,
  ): void {
    super.removeEventListener(type, callback, options)
  }
  async addCard(node: Node) {
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
        const card = await this.parseCard(node)
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
  async removeCard(node: Node) {
    if (node instanceof HTMLElement && node.classList.contains('card')) {
      const { id } = await this.parseCard(node)
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
  async parseCard(element: HTMLElement): Promise<FeedsCard> {
    const getSimpleText = async (selector: string) => {
      const subElement = await sq(
        () => element.querySelector(selector),
        it => it !== null || element.parentNode === null,
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
    const getComplexText = async (type: FeedsCardType) => {
      if (type === feedsCardTypes.bangumi) {
        return ''
      }
      const el = await sq(() => element, (it: any) => Boolean(it.__vue__ || !element.parentNode))
      if (element.parentNode === null) {
        // console.log('skip detached node:', element)
        return ''
      }
      if (el === null) {
        console.warn(el)
        return ''
      }
      if (type === feedsCardTypes.repost) {
        const originalCard = JSON.parse(el.__vue__.card.origin)
        const originalText = el.__vue__.originCardData.pureText
        const originalDescription = lodash.get(originalCard, 'item.description', '')
        const originalTitle = originalCard.title
        const currentText = el.__vue__.card.item.content
        return [
          currentText,
          originalText,
          originalDescription,
          originalTitle,
        ].filter(it => Boolean(it)).join('\n')
      }
      const currentText = el.__vue__.originCardData.pureText
      const currentTitle = el.__vue__.originCardData.title
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
      presented: true,
      async getText() {
        const result = await getComplexText(this.type)
        this.text = result
        // console.log(result)
        return result
      },
    }
    await card.getText()
    card.presented = element.parentNode !== null
    element.setAttribute('data-type', card.type.id.toString())
    if (card.type === feedsCardTypes.repost) {
      const currentUsername = card.username
      const repostUsername = lodash.get(card, 'element.__vue__.card.origin_user.info.uname', '')
      if (currentUsername === repostUsername) {
        element.setAttribute('data-self-repost', 'true')
      }
    }
    // if (card.text === '') {
    //   console.warn('card text parsing failed!', card)
    // }
    return card
  }
  async startWatching() {
    const updateCards = (cardsList: HTMLElement) => {
      const cards = [...cardsList.querySelectorAll('.card[data-did]')]
      cards.forEach(it => this.addCard(it))
      return childList(cardsList, records => {
        records.forEach(record => {
          record.addedNodes.forEach(node => this.addCard(node))
          record.removedNodes.forEach(node => this.removeCard(node))
        })
      })
    }

    if (this.watching) {
      return true
    }
    this.watching = true
    if (document.URL.includes('//space.bilibili.com')) {
      const container = await select('.s-space') as HTMLDivElement
      if (!container) {
        return false
      }
      let cardListObserver: MutationObserver = null
      childList(container, async () => {
        if (dq('#page-dynamic')) {
          const cardsList = await select('.feed-card .content') as HTMLElement
          console.log('enter feeds tab')
          if (cardListObserver) {
            cardListObserver.disconnect()
          }
          [cardListObserver] = updateCards(cardsList)
        } else {
          console.log('leave feeds tab')
          if (cardListObserver) {
            cardListObserver.disconnect()
            cardListObserver = null
          }
        }
      })
      return true
    }
    const cardsList = await select('.feed-card .content, .detail-content .detail-card') as HTMLDivElement
    if (!cardsList) {
      return false
    }
    updateCards(cardsList)
    return true
  }
}
export const feedsCardsManager = new FeedsCardsManager()

/**
 * 搜索视频卡片中重复的 aid, 合并为联合投稿
 * @param cards 视频卡片
 */
export const groupVideoFeeds = (cards: VideoCard[]) => {
  const groups = lodash.groupBy(cards, c => c.aid)
  const cardToCooperationItem = (card: VideoCard) => (
    {
      id: card.upID,
      name: card.upName,
      faceUrl: card.upFaceUrl,
    }
  )
  const results = Object.values(groups).map(groupCards => {
    if (groupCards.length === 1) {
      return groupCards[0]
    }
    const [firstCard, ...restCards] = groupCards
    firstCard.cooperation = [
      cardToCooperationItem(firstCard),
      ...restCards.map(cardToCooperationItem),
    ]
    console.log([...firstCard.cooperation])
    return firstCard
  }).sort(descendingStringSort(it => it.id))
  return results
}
export const getVideoFeeds = async (type: 'video' | 'bangumi' = 'video'): Promise<VideoCard[]> => {
  if (!getUID()) {
    return []
  }
  const json = await getJsonWithCredentials(
    `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${getUID()}&type_list=${type === 'video' ? 8 : 512}`,
  )
  if (json.code !== 0) {
    throw new Error(json.message)
  }
  if (type === 'video') {
    return groupVideoFeeds(json.data.cards.map(
      (c: any): VideoCard => {
        const card = JSON.parse(c.card)
        const topics = lodash.get(c, 'display.topic_info.topic_details', []).map(
          (it: any) => ({
            id: it.topic_id,
            name: it.topic_name,
          }),
        )
        return {
          id: c.desc.dynamic_id_str,
          aid: card.aid,
          bvid: c.desc.bvid || card.bvid,
          title: card.title,
          upID: c.desc.user_profile.info.uid,
          upName: c.desc.user_profile.info.uname,
          upFaceUrl: c.desc.user_profile.info.face,
          coverUrl: card.pic,
          description: card.desc,
          timestamp: c.timestamp,
          time: new Date(c.timestamp * 1000),
          topics,
          dynamic: card.dynamic,
          like: formatCount(c.desc.like),
          duration: card.duration,
          durationText: formatDuration(card.duration, 0),
          playCount: formatCount(card.stat.view),
          danmakuCount: formatCount(card.stat.danmaku),
          watchlater: watchlaterList.includes(card.aid),
        }
      },
    ))
  } if (type === 'bangumi') {
    return json.data.cards.map(
      (c: any): VideoCard => {
        const card = JSON.parse(c.card)
        return {
          id: c.desc.dynamic_id_str,
          aid: card.aid,
          bvid: c.desc.bvid || card.bvid,
          epID: card.episode_id,
          title: card.new_desc,
          upName: card.apiSeasonInfo.title,
          upFaceUrl: card.apiSeasonInfo.cover,
          coverUrl: card.cover,
          description: '',
          timestamp: c.timestamp,
          time: new Date(c.timestamp * 1000),
          like: formatCount(c.desc.like),
          durationText: '',
          playCount: formatCount(card.play_count),
          danmakuCount: formatCount(card.bullet_count),
          watchlater: false,
        }
      },
    )
  }
  return []
}

// let mockupCalled = false
/**
 * 获取动态
 * @param type 动态类型, 或传入类型ID列表返回最新动态
 * @param afterID 返回指定ID之前的动态历史, 省略则返回最新的动态
 */
export const getFeeds = async (type: FeedsCardType | string, afterID?: string | number) => {
  if (typeof type === 'string') {
    return getJsonWithCredentials(`https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${getUID()}&type_list=${type}`)
  }
  const id = type.id.toString()
  let api = `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${getUID()}&type_list=${id}`
  if (afterID) {
    api = `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_history?uid=${getUID()}&offset_dynamic_id=${afterID}&type=${id}`
  }
  return getJsonWithCredentials(api)
}
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

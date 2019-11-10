import { VideoCardInfo } from '../style/simplify-home/video-card-info'

export interface FeedsCardType {
  id: number
  name: string
}
export const feedsCardTypes: { [name: string]: FeedsCardType } = {
  repost: {
    id: 1,
    name: '转发',
  },
  textWithImages: {
    id: 2,
    name: '图文',
  },
  text: {
    id: 4,
    name: '文字',
  },
  video: {
    id: 8,
    name: '视频',
  },
  miniVideo: {
    id: 16,
    name: '小视频',
  },
  column: {
    id: 64,
    name: '专栏',
  },
  audio: {
    id: 256,
    name: '音频',
  },
  bangumi: {
    id: 512,
    name: '番剧',
  },
  share: {
    id: 2048,
    name: '分享',
  },
}
export interface FeedsCard {
  id: string
  username: string
  text: string
  reposts: number
  comments: number
  likes: number
  element: HTMLElement
  type: FeedsCardType
}
class FeedsCardsManager extends EventTarget {
  cards: FeedsCard[] = []
  addEventListener(
    type: 'addCard' | 'removeCard',
    listener: EventListener | EventListenerObject | null,
    options?: boolean | AddEventListenerOptions | undefined
  ): void {
    super.addEventListener(type, listener, options)
  }
  removeEventListener(
    type: 'addCard' | 'removeCard',
    callback: EventListener | EventListenerObject | null,
    options?: boolean | AddEventListenerOptions | undefined
  ): void {
    super.removeEventListener(type, callback, options)
  }
  async addCard(node: Node) {
    if (node instanceof HTMLElement && node.classList.contains('card')) {
      if (node.querySelector('.skeleton') !== null) {
        const obs = Observer.childList(node, () => {
          if (node.querySelector('.skeleton') === null) {
            obs.stop()
            this.addCard(node)
          }
        })
      } else {
        const card = await this.parseCard(node)
        this.cards.push(card)
        const event = new CustomEvent('addCard', { detail: card })
        this.dispatchEvent(event)
      }
    }
  }
  async removeCard(node: Node) {
    if (node instanceof HTMLElement && node.classList.contains('card')) {
      const id = (await this.parseCard(node)).id
      const index = this.cards.findIndex(c => c.id === id)
      const card = this.cards[index]
      this.cards.splice(index, 1)
      const event = new CustomEvent('removeCard', { detail: card })
      this.dispatchEvent(event)
    }
  }
  async parseCard(element: HTMLElement): Promise<FeedsCard> {
    const getText = async (selector: string) => {
      const subElement = await SpinQuery.condition(
        () => element.querySelector(selector),
        it => it !== null
      ) as HTMLElement
      if (subElement === null) {
        console.warn(element, selector)
        return ''
      }
      return subElement.innerText
    }
    const getNumber = async (selector: string) => {
      const result = parseInt(await getText(selector))
      if (isNaN(result)) {
        return 0
      }
      return result
    }
    const type: FeedsCardType = (() => {
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
    })()
    const card = {
      id: element.getAttribute('data-did') as string,
      username: await getText('.main-content .user-name'),
      text: await getText('.card-content .text.description,.video-container .title,.bangumi-container .title'),
      reposts: await getNumber('.button-bar .single-button:nth-child(1) .text-offset'),
      comments: await getNumber('.button-bar .single-button:nth-child(2) .text-offset'),
      likes: await getNumber('.button-bar .single-button:nth-child(3) .text-offset'),
      element,
      type,
    }
    element.setAttribute('data-type', type.id.toString())
    return card
  }
  async startWatching() {
    const cardsList = await SpinQuery.select('.card-list .content') as HTMLDivElement
    if (!cardsList) {
      return false
    }
    const cards = [...cardsList.querySelectorAll('.content>.card')]
    cards.forEach(it => this.addCard(it))
    Observer.childList(cardsList, records => {
      records.forEach(record => {
        record.addedNodes.forEach(node => this.addCard(node))
        record.removedNodes.forEach(node => this.removeCard(node))
      })
    })
    return true
  }
}
export const feedsCardsManager = new FeedsCardsManager()

export const getVideoFeeds = async (type: 'video' | 'bangumi' = 'video'): Promise<VideoCardInfo[]> => {
  const json = await Ajax.getJsonWithCredentials(
    `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${getUID()}&type_list=${type === 'video' ? 8 : 512}`
  )
  if (json.code !== 0) {
    throw new Error(json.message)
  }
  if (type === 'video') {
    const { getWatchlaterList } = await import(
      '../video/watchlater-api'
    )
    const watchlaterList = await getWatchlaterList()
    return json.data.cards.map(
      (c: any): VideoCardInfo => {
        const card = JSON.parse(c.card)
        const topics = _.get(c, 'display.topic_info.topic_details', []).map(
          (it: any) => {
            return {
              id: it.topic_id,
              name: it.topic_name
            }
          }
        )
        return {
          id: c.desc.dynamic_id_str,
          aid: card.aid,
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
          watchlater: watchlaterList.includes(card.aid)
        }
      }
    )
  } else if (type === 'bangumi') {
    return json.data.cards.map(
      (c: any): VideoCardInfo => {
        const card = JSON.parse(c.card)
        return {
          id: c.desc.dynamic_id_str,
          aid: card.aid,
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
      }
    )

  } else {
    return []
  }
}

export default {
  export: {
    feedsCardsManager,
    feedsCardTypes,
    getVideoFeeds,
  },
}

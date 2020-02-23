import { VideoCardInfo } from '../style/simplify-home/video-card-info'

export interface FeedsCardType {
  id: number
  name: string
  // getText: (element: HTMLElement) => Promise<string>
}
// const getOriginalElement = async (element: Element) => {
//   const originalElement = await SpinQuery.condition(
//     () => element.querySelector('.card-content > .text.description'),
//     it => it !== null
//   ) as HTMLElement
//   if (originalElement === null) {
//     return ''
//   }
//   const text = originalElement.style.display === 'none' ? '' : originalElement.textContent!.trim()
//   return text
// }
export const feedsCardTypes = {
  repost: {
    id: 1,
    name: '转发',
  } as FeedsCardType,
  textWithImages: {
    id: 2,
    name: '图文'
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
class FeedsCardsManager extends EventTarget {
  watching = false
  cards: FeedsCard[] = []
  addEventListener(
    type: 'addCard' | 'removeCard',
    listener: (event: CustomEvent<FeedsCard>) => void,
    options?: boolean | AddEventListenerOptions | undefined
  ): void {
    super.addEventListener(type, listener, options)
  }
  removeEventListener(
    type: 'addCard' | 'removeCard',
    callback: (event: CustomEvent<FeedsCard>) => void,
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
        this.cards.sort((a, b) => {
          if (a.id === b.id) {
            return 0
          }
          return a.id > b.id ? -1 : 1
        })
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
    const getSimpleText = async (selector: string) => {
      const subElement = await SpinQuery.condition(
        () => element.querySelector(selector),
        it => it !== null
      ) as HTMLElement
      if (subElement === null) {
        console.warn(element, selector)
        return ''
      }
      // const subElementText = subElement.style.display === 'none' ? '' : subElement.textContent!.trim()
      const subElementText = subElement.innerText.trim()
      return subElementText
    }
    // const getComplexText = async () => {
    //   // if ([
    //   //   feedsCardTypes.column,
    //   // ].some(it => it === type)) {
    //   //   const text = await getSimpleText(selector)
    //   //   return text
    //   // }
    //   let repostText = ''
    //   const repost = await SpinQuery.condition(
    //     () => element.querySelector('.original-card-content'),
    //     it => {
    //       if (it === null) {
    //         return false
    //       }
    //       if (getFeedsCardType(it) === feedsCardTypes.column) {
    //         return true
    //       }
    //       const bangumiContent = it.querySelector('.bangumi-container .title') as HTMLElement
    //       if (bangumiContent) {
    //         repostText = bangumiContent.innerText
    //       }
    //       const repostContent = it.querySelector('.text.description') as HTMLElement
    //       const videoContent = it.querySelector('.video-container .title') as HTMLElement
    //       if (repostContent && videoContent) {
    //         repostText = repostContent.innerText + '\n' + videoContent.innerText
    //         return Boolean(videoContent.innerText)
    //       }
    //       if (repostContent) {
    //         repostText = repostContent.innerText
    //       }
    //       return Boolean(repostText)
    //     },
    //   ) as HTMLElement
    //   const text = await getSimpleText('.video-container .title,.bangumi-container .title,.text.description')
    //   if (getFeedsCardType(repost) === feedsCardTypes.column) {
    //     // debugger
    //     console.log(element, repost, text)
    //   }
    //   // console.log(repost, repost && repost.innerText, subElementText)
    //   return repost ? (text + '\n' + repostText).trim() : text
    // }
    const getComplexText = async (type: FeedsCardType) => {
      if (type === feedsCardTypes.bangumi) {
        return ''
      }
      const el = await SpinQuery.condition(() => element, (it: any) => Boolean(it.__vue__))
      if (el === null) {
        console.warn(el)
        return ''
      }
      if (type === feedsCardTypes.repost) {
        const original = el.__vue__.originCardData.pureText
        return el.__vue__.card.item.content + '\n' + original || ''
      }
      return el.__vue__.originCardData.pureText || ''
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
      async getText() {
        const result = await getComplexText(this.type)
        this.text = result
        // console.log(result)
        return result
      }
    }
    await card.getText()
    element.setAttribute('data-type', card.type.id.toString())
    // if (card.text === '') {
    //   console.warn('card text parsing failed!', card)
    // }
    return card
  }
  async startWatching() {
    const cardsList = await SpinQuery.select('.card-list .content') as HTMLDivElement
    if (!cardsList) {
      return false
    }
    if (this.watching) {
      return true
    }
    this.watching = true
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
  if (!getUID()) {
    return []
  }
  const json = await Ajax.getJsonWithCredentials(
    `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${getUID()}&type_list=${type === 'video' ? 8 : 512}`
  )
  if (json.code !== 0) {
    throw new Error(json.message)
  }
  if (type === 'video') {
    // const { getWatchlaterList } = await import(
    //   '../video/watchlater-api'
    // )
    // const watchlaterList = await getWatchlaterList()
    return json.data.cards.filter((c: any) => {
      // 合作视频仅取UP主的
      return c.desc.orig_dy_id === 0
    }).map(
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
          watchlater: store.state.watchlaterList.includes(card.aid)
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

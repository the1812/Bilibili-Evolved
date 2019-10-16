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
  addCard(node: Node) {
    if (node instanceof HTMLElement && node.classList.contains('card')) {
      if (node.querySelector('.skeleton') !== null) {
        const obs = Observer.childList(node, () => {
          if (node.querySelector('.skeleton') === null) {
            obs.forEach(it => it.stop())
            this.addCard(node)
          }
        })
      } else {
        const card = this.parseCard(node)
        this.cards.push(card)
        const event = new CustomEvent('addCard', { detail: card })
        this.dispatchEvent(event)
      }
    }
  }
  removeCard(node: Node) {
    if (node instanceof HTMLElement && node.classList.contains('card')) {
      const id = this.parseCard(node).id
      const index = this.cards.findIndex(c => c.id === id)
      const card = this.cards[index]
      this.cards.splice(index, 1)
      const event = new CustomEvent('removeCard', { detail: card })
      this.dispatchEvent(event)
    }
  }
  parseCard(element: HTMLElement): FeedsCard {
    const getText = (selector: string) => {
      if (element.querySelector(selector) === null) {
        // console.log(element, selector)
        return ''
      }
      return (element.querySelector(selector) as HTMLElement).innerText
    }
    const getNumber = (selector: string) => {
      const result = parseInt(getText(selector))
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
      username: getText('.main-content .user-name'),
      text: getText('.card-content .text.description'),
      reposts: getNumber('.button-bar .single-button:nth-child(1) .text-offset'),
      comments: getNumber('.button-bar .single-button:nth-child(2) .text-offset'),
      likes: getNumber('.button-bar .single-button:nth-child(3) .text-offset'),
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

export default {
  export: {
    feedsCardsManager,
    feedsCardTypes,
  },
}

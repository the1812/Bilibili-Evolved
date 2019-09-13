interface ActivityCard {
  id: string
  username: string
  text: string
  reposts: number
  comments: number
  likes: number
}
class ActivityCardsManager extends EventTarget {
  cards: ActivityCard[] = []
  addCard(node: Node) {
    if (node instanceof Element && node.classList.contains('card')) {
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
    if (node instanceof Element && node.classList.contains('card')) {
      const id = this.parseCard(node).id
      const index = this.cards.findIndex(c => c.id === id)
      const card = this.cards[index]
      this.cards.splice(index, 1)
      const event = new CustomEvent('removeCard', { detail: card })
      this.dispatchEvent(event)
    }
  }
  parseCard(element: Element): ActivityCard {
    const getText = (selector: string) => {
      if (element.querySelector(selector) === null) {
        console.log(element, selector)
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
    const card = {
      id: element.getAttribute('data-did') as string,
      username: getText('.main-content .user-name'),
      text: getText('.card-content .text.description'),
      reposts: getNumber('.button-bar .single-button:nth-child(1) .text-offset'),
      comments: getNumber('.button-bar .single-button:nth-child(2) .text-offset'),
      likes: getNumber('.button-bar .single-button:nth-child(3) .text-offset'),
    }
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
export const activityCardsManager = new ActivityCardsManager()

export default {
  export: {
    activityCardsManager
  },
}

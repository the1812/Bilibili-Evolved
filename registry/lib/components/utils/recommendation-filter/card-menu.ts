import { openManager } from './manager'

const menuSelector = '.bili-video-card__info--no-interest-panel'
const buttonClass = 'be-recommendation-filter-import'
let activeCard: Element | undefined

const addMenuItem = (menu: Element) => {
  if (!activeCard?.isConnected || menu.querySelector(`.${buttonClass}`)) {
    return
  }
  const button = document.createElement('button')
  button.type = 'button'
  button.className = `bili-video-card__info--no-interest-panel--item ${buttonClass}`
  button.textContent = '导入过滤词'
  button.addEventListener('click', async event => {
    event.preventDefault()
    event.stopPropagation()
    const title = activeCard?.isConnected
      ? activeCard.querySelector('.bili-video-card__info--tit')
      : undefined
    const text = (title?.getAttribute('title') || title?.textContent || '').trim()
    if (text) {
      await openManager(text)
    }
  })
  menu.append(button)
}

const onMouseOver = (event: MouseEvent) => {
  if (!(event.target instanceof Element)) {
    return
  }
  const trigger = event.target.closest('.bili-video-card__info--no-interest')
  if (!trigger || (event.relatedTarget instanceof Node && trigger.contains(event.relatedTarget))) {
    return
  }
  const card = trigger.closest('.bili-video-card')
  if (!card?.closest('.recommended-container_floor-aside, .feed2')) {
    activeCard = undefined
    return
  }
  activeCard = card
  document.querySelectorAll(menuSelector).forEach(addMenuItem)
}

export const updateCardMenus = (records: MutationRecord[]) => {
  if (!activeCard?.isConnected) {
    return
  }
  records.forEach(record => {
    record.addedNodes.forEach(node => {
      if (node instanceof Element) {
        if (node.matches(menuSelector)) {
          addMenuItem(node)
        }
        node.querySelectorAll(menuSelector).forEach(addMenuItem)
      }
    })
  })
}

export const activateCardMenu = () => document.addEventListener('mouseover', onMouseOver, true)
export const deactivateCardMenu = () => {
  document.removeEventListener('mouseover', onMouseOver, true)
  document.querySelectorAll(`.${buttonClass}`).forEach(button => button.remove())
  activeCard = undefined
}

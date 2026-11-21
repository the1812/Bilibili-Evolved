import { mutationObserve } from '@/core/observer'
import { select } from '@/core/spin-query'

export const addBpxMenuItem = async (item: HTMLLIElement, signal: AbortSignal) => {
  const contextArea = await select('#bilibili-player .bpx-player-context-area')
  if (!contextArea || signal.aborted) {
    return
  }
  const [observer] = mutationObserve(
    [contextArea],
    { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] },
    () => {
      const menu = contextArea.querySelector('.bpx-player-contextmenu.bpx-player-active')
      if (menu?.querySelector(':scope > [data-action="keyboard"]')) {
        if (!menu.contains(item)) {
          const colorItem = menu.querySelector(':scope > [data-action="color"]')
          if (colorItem) {
            colorItem.after(item)
          } else {
            menu.prepend(item)
          }
        }
      } else {
        item.remove()
      }
    },
  )
  signal.addEventListener(
    'abort',
    () => {
      observer.disconnect()
      item.remove()
    },
    { once: true },
  )
}

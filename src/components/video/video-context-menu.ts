import { childList } from '@/core/observer'
import { hasVideo, select } from '@/core/spin-query'

/** 播放器右键菜单 */
export interface PlayerContextMenu {
  /** 总体容器元素, 不是里面那个 <ul> */
  containerElement: HTMLElement
  /** 里面的 <ul> 列表元素 */
  listElement: HTMLElement
  /** 所有菜单项元素 */
  itemElements: HTMLElement[]
  /** 是否已打开 */
  isOpen: boolean
}
/** 在播放器菜单打开/关闭时执行特定操作 */
export const forEachContextMenu = async (action: {
  open?: (menu: PlayerContextMenu) => void
  close?: (menu: PlayerContextMenu) => void
}) => {
  const { open, close } = action
  if (!hasVideo()) {
    return
  }
  const player = (await select('.bilibili-player')) as HTMLElement
  if (!player) {
    return
  }
  const [playerObserver] = childList(player, () => {
    const container = dq('.bilibili-player-context-menu-origin') as HTMLElement
    if (container) {
      playerObserver.disconnect()
      const ul = dq(container, 'ul') as HTMLElement
      const menu: PlayerContextMenu = {
        containerElement: container,
        listElement: ul,
        get itemElements() {
          return dqa(container, '.context-menu-function') as HTMLElement[]
        },
        get isOpen() {
          return container.classList.contains('active')
        },
      }
      childList(ul, () => {
        if (menu.isOpen) {
          // 打开菜单
          open?.(menu)
        } else {
          // 关闭菜单
          close?.(menu)
        }
      })
    }
  })
}
/** 添加播放器菜单项 */
export const addMenuItem = async (
  element: HTMLElement,
  cleanUp?: (menu: PlayerContextMenu) => void,
) =>
  forEachContextMenu({
    open: menu => {
      if (menu.listElement.contains(element)) {
        return
      }
      // <li class="context-line context-menu-function" data-append="1">
      //    <a class="context-menu-a js-action" href="javascript:void(0);"></a>
      // </li>
      const menuItem = document.createElement('li')
      menuItem.classList.add('context-line', 'context-menu-function')
      menuItem.setAttribute('data-append', '1')
      const linkWrapper = document.createElement('a')
      linkWrapper.classList.add('context-menu-a', 'js-action')
      linkWrapper.href = 'javascript:void(0);'
      linkWrapper.appendChild(element)
      menuItem.addEventListener('mouseover', () => menuItem.classList.add('hover'))
      menuItem.addEventListener('mouseout', () => menuItem.classList.remove('hover'))
      menuItem.appendChild(linkWrapper)
      menu.listElement.appendChild(menuItem)
    },
    close: menu => cleanUp?.(menu),
  })

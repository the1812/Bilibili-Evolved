import { childListSubtree } from '@/core/observer'
import type { MarkingInstruction } from './types'

const SELECTOR_VIDEO_POD_LIST = '.video-pod__list'
const SELECTOR_VIDEO_POD = '.video-pod'

export const getVideoPodElement = () => dq(SELECTOR_VIDEO_POD)

export const getPodItemElement = (key: string) =>
  dq(`${SELECTOR_VIDEO_POD_LIST} [data-key="${key}"]`) as HTMLElement | null

export const getMarkedElements = (classes: string[]) => dqa(`.${classes.join(', .')}`)

export const getPodItemById = (id: string) => getPodItemElement(id)

export const isHasMultiPagePodItem = (element: Element) =>
  element.firstElementChild ? element.firstElementChild.classList.contains('multi-p') : false

export const getMultiPagePodItemPageItem = (podItemElement: Element, page: number) =>
  podItemElement.querySelector(`.page-list .page-item:nth-child(${page})`)

export const getMultiPagePodItemPageItems = (podItemElement: Element) =>
  Array.from(podItemElement.querySelectorAll('.page-list .page-item'))

const getClickableTitleElement = (element: Element) => {
  const titleElement = element.querySelector('.title')
  if (titleElement instanceof HTMLElement) {
    return titleElement
  }
  return element instanceof HTMLElement ? element : null
}

const getMultiPageClickableTitleElement = (podItemElement: Element, page?: number) => {
  if (page === undefined) {
    return null
  }
  const pageItemElement = getMultiPagePodItemPageItem(podItemElement, page)
  if (!(pageItemElement instanceof HTMLElement)) {
    return null
  }
  return getClickableTitleElement(pageItemElement)
}

export const clickPodItemById = (id: string) => {
  const node = getPodItemById(id)
  if (!node) {
    return false
  }
  node.click()
  return true
}

export const clickInstructionTarget = (
  instruction: Pick<MarkingInstruction, 'bvid' | 'cid' | 'page'>,
) => {
  const ids = [instruction.bvid, instruction.cid]
    .filter((id): id is string | number => id !== undefined && id !== null)
    .map(String)

  for (const id of ids) {
    const podItemElement = getPodItemById(id)
    if (!podItemElement) {
      continue
    }
    if (isHasMultiPagePodItem(podItemElement)) {
      const clickableElement = getMultiPageClickableTitleElement(podItemElement, instruction.page)
      if (clickableElement) {
        clickableElement.click()
        return true
      }
      continue
    }
    const clickableElement = getClickableTitleElement(podItemElement)
    if (clickableElement) {
      clickableElement.click()
      return true
    }
  }
  return false
}

export const observeVideoPod = (callback: () => void) => {
  const target = getVideoPodElement()
  if (!target) {
    return lodash.noop
  }
  const [observer] = childListSubtree(target, lodash.debounce(callback, 50))
  return () => observer.disconnect()
}

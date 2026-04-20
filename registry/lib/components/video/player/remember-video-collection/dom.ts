import { childListSubtree } from '@/core/observer'
import { sq } from '@/core/spin-query'
import type { MarkingInstruction } from './types'

const SELECTOR_VIDEO_POD_LIST = '.video-pod__list'
const SELECTOR_VIDEO_POD = '.video-pod'
const SELECTOR_VIDEO_POD_SLIDE = '.video-pod__slide'
const SELECTOR_VIDEO_POD_SLIDE_ITEM = '.slide-item[data-slide-value]'
const SELECTOR_VIDEO_POD_SLIDE_ITEM_ACTIVE = '.slide-item.active[data-slide-value]'

export const getVideoPodElement = () => dq(SELECTOR_VIDEO_POD)

export const getPodItemElement = (key: string) =>
  dq(`${SELECTOR_VIDEO_POD_LIST} [data-key="${key}"]`) as HTMLElement | null

export const getMarkedElements = (classes: string[]) => dqa(`.${classes.join(', .')}`)

export const getPodItemById = (id: string) => getPodItemElement(id)

const getSlideItemElement = (id: string) =>
  dq(
    `${SELECTOR_VIDEO_POD_SLIDE} ${SELECTOR_VIDEO_POD_SLIDE_ITEM}[data-slide-value="${id}"]`,
  ) as HTMLElement | null

const getActiveSlideItemElement = () =>
  dq(`${SELECTOR_VIDEO_POD_SLIDE} ${SELECTOR_VIDEO_POD_SLIDE_ITEM_ACTIVE}`) as HTMLElement | null

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

const getInstructionIds = (instruction: Pick<MarkingInstruction, 'bvid' | 'cid'>) =>
  [instruction.bvid, instruction.cid]
    .filter((id): id is string | number => id !== undefined && id !== null)
    .map(String)

const getInstructionClickableElementInCurrentTab = (
  instruction: Pick<MarkingInstruction, 'bvid' | 'cid' | 'page'>,
) => {
  const ids = getInstructionIds(instruction)

  for (const id of ids) {
    const podItemElement = getPodItemById(id)
    if (!podItemElement) {
      continue
    }
    if (isHasMultiPagePodItem(podItemElement)) {
      const clickableElement = getMultiPageClickableTitleElement(podItemElement, instruction.page)
      if (clickableElement) {
        return clickableElement
      }
      continue
    }
    const clickableElement = getClickableTitleElement(podItemElement)
    if (clickableElement) {
      return clickableElement
    }
  }
  return null
}

const clickInstructionTargetInCurrentTab = (
  instruction: Pick<MarkingInstruction, 'bvid' | 'cid' | 'page'>,
) => {
  const clickableElement = getInstructionClickableElementInCurrentTab(instruction)
  if (!clickableElement) {
    return false
  }
  clickableElement.click()
  return true
}

const switchToTargetSlide = async (sectionId?: number) => {
  if (sectionId === undefined) {
    return false
  }
  const slideItem = getSlideItemElement(String(sectionId))
  if (!(slideItem instanceof HTMLElement)) {
    return false
  }
  const activeSlideItem = getActiveSlideItemElement()
  if (activeSlideItem?.dataset.slideValue === String(sectionId)) {
    return true
  }
  slideItem.click()
  const switchedSlideItem = await sq(
    () => getActiveSlideItemElement(),
    item => item?.dataset.slideValue === String(sectionId),
    {
      maxRetry: 8,
      queryInterval: 50,
    },
  )
  return Boolean(switchedSlideItem)
}

export const clickInstructionTarget = async (
  instruction: Pick<MarkingInstruction, 'bvid' | 'cid' | 'page' | 'sectionId'>,
) => {
  if (clickInstructionTargetInCurrentTab(instruction)) {
    return true
  }
  const switched = await switchToTargetSlide(instruction.sectionId)
  if (!switched) {
    return false
  }
  const clickableElement = await sq(
    () => getInstructionClickableElementInCurrentTab(instruction),
    element => element instanceof HTMLElement,
    {
      maxRetry: 8,
      queryInterval: 50,
    },
  )
  if (!(clickableElement instanceof HTMLElement)) {
    return false
  }
  clickableElement.click()
  return true
}

export const observeVideoPod = (callback: () => void) => {
  const target = getVideoPodElement()
  if (!target) {
    return lodash.noop
  }
  const [observer] = childListSubtree(
    target,
    lodash.debounce(records => {
      // childListSubtree 在创建 observer 后会立即用空 records 调一次回调。
      // remember-video-collection 在启动 observer 前已经手动 render 过一次，
      // 这里跳过初始化首调，避免对同一批指令重复 apply。
      if (records.length === 0) {
        return
      }
      callback()
    }, 50),
  )
  return () => observer.disconnect()
}

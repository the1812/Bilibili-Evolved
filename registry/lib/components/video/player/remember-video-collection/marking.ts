import { useScopedConsole } from '@/core/utils/log'
import { sortHistory } from './history'
import { MarkingStyle, SectionMode } from './types'
import type { ComponentHistory, ComponentMemory, MarkingInstruction } from './types'
import {
  getMarkedElements,
  getVideoPodElement,
  observeVideoPod,
  getPodItemById,
  isHasMultiPagePodItem,
  getMultiPagePodItemPageItem,
  getMultiPagePodItemPageItems,
} from './dom'

const logger = useScopedConsole('remember-video-collection')

const watchedClass = 'be-rvc-watched'
const lastClass = 'be-rvc-last'
const multiPagePodItemClass = 'be-rvc-multi-page'
const multiPageAllWatchedClass = 'be-rvc-multi-page-all-watched'
// const gridWatchedClass = 'be-rvc-grid-watched'
// const gridLastClass = 'be-rvc-grid-last'
const styleDefaultClass = 'be-rvc-style-default'
const styleDistinguishClass = 'be-rvc-style-distinguish'

let frame = 0

const clearMarks = () => {
  getMarkedElements([
    watchedClass,
    lastClass,
    multiPagePodItemClass,
    multiPageAllWatchedClass,
  ]).forEach(element => {
    element.classList.remove(
      watchedClass,
      lastClass,
      multiPagePodItemClass,
      multiPageAllWatchedClass,
    )
  })
}

const applyMultiPageCompletionState = () => {
  getMarkedElements([multiPagePodItemClass]).forEach(element => {
    const pageItems = getMultiPagePodItemPageItems(element)
    const allWatched =
      pageItems.length > 0 &&
      pageItems.every(
        pageItem =>
          pageItem.classList.contains(watchedClass) || pageItem.classList.contains(lastClass),
      )
    element.classList.toggle(multiPageAllWatchedClass, allWatched)
  })
}

const applyInstruction = (instruction: MarkingInstruction) => {
  const ids = [instruction.bvid, instruction.cid]
    .filter((id): id is string | number => id !== undefined && id !== null)
    .map(String)
  if (ids.length === 0) {
    logger.warn('applyInstruction skipped: empty instruction id.', instruction)
    return
  }
  let podItemElement: HTMLElement | null = null
  for (const id of ids) {
    podItemElement = getPodItemById(id)
    if (podItemElement) {
      break
    }
  }
  if (!podItemElement) {
    logger.warn('applyInstruction skipped: target not found.', { ids, instruction })
    return
  }

  const markingClass = instruction.type === 'last-played' ? lastClass : watchedClass
  if (isHasMultiPagePodItem(podItemElement) && instruction.page !== undefined) {
    podItemElement.classList.add(multiPagePodItemClass)
    const pageItemElement = getMultiPagePodItemPageItem(podItemElement, instruction.page)
    if (pageItemElement) {
      pageItemElement.classList.add(markingClass)
    }
  }

  podItemElement.classList.add(markingClass)
}

const runRender = (instructions: MarkingInstruction[]) => {
  frame = 0
  clearMarks()
  for (const instruction of instructions) {
    applyInstruction(instruction)
  }
  applyMultiPageCompletionState()
}

const abortRunningRender = () => {
  if (frame !== 0) {
    cancelAnimationFrame(frame)
    frame = 0
  }
}

export const clearMarkings = () => {
  abortRunningRender()
  clearMarks()
  const root = getVideoPodElement()
  root?.classList.remove(styleDefaultClass, styleDistinguishClass)
}

export const setMarkingStyle = (style: MarkingStyle) => {
  const root = getVideoPodElement()
  if (!root) {
    return
  }
  root.classList.remove(styleDefaultClass, styleDistinguishClass)
  root.classList.add(style === MarkingStyle.Distinguish ? styleDistinguishClass : styleDefaultClass)
}

export const renderMarkings = (instructions: MarkingInstruction[]) => {
  abortRunningRender()
  frame = requestAnimationFrame(() => {
    runRender(instructions)
  })
}

const mapGroupToInstructions = (history: ComponentHistory): MarkingInstruction[] => {
  const sortedHistory = sortHistory([...history])
  const lastIndex = sortedHistory.length - 1

  return sortedHistory.map((memory, index) => ({
    bvid: memory.bvid,
    cid: memory.cid,
    page: memory.page,
    sectionId: memory.sectionId,
    timestamp: memory.timestamp,
    type: index === lastIndex ? 'last-played' : 'watched',
  }))
}

export const getMarkedInstructions = (
  history: ComponentHistory,
  sectionMode?: SectionMode,
): MarkingInstruction[] => {
  if (!Array.isArray(history) || history.length === 0) {
    return []
  }

  if (sectionMode !== SectionMode.Split) {
    return mapGroupToInstructions(history)
  }

  return Object.values(lodash.groupBy(history, memory => memory.sectionId)).flatMap(
    mapGroupToInstructions,
  )
}

export const startMarkingObserver = (callback: () => void) => {
  return observeVideoPod(callback)
}

export const getLastPlayedInstruction = (
  currentInstructions: MarkingInstruction[],
  currentMemory: ComponentMemory,
  sectionMode: SectionMode,
) => {
  // 分别记忆模式 - 至少有两个 last-played，需要根据当前的合集情况确定使用哪个
  if (sectionMode === SectionMode.Split) {
    return lodash.maxBy(
      lodash.filter(currentInstructions, {
        type: 'last-played',
        sectionId: currentMemory.sectionId,
      }),
      'timestamp',
    )
  }
  return lodash.maxBy(lodash.filter(currentInstructions, { type: 'last-played' }), 'timestamp')
}

export const isSameAsLastPlayedInstruction = (
  currentMemory: ComponentMemory,
  instruction?: MarkingInstruction,
) => {
  if (!instruction) {
    return true
  }
  return (
    currentMemory.bvid === instruction.bvid &&
    currentMemory.cid === instruction.cid &&
    currentMemory.page === instruction.page
  )
}

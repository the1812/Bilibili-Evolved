import { useScopedConsole } from '@/core/utils/log'
import { sq } from '@/core/spin-query'
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
const styleDefaultClass = 'be-rvc-style-default'
const styleDistinguishClass = 'be-rvc-style-distinguish'

let frame = 0
let renderToken = 0
let styleToken = 0

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

const getInstructionIds = (instruction: Pick<MarkingInstruction, 'bvid' | 'cid'>) =>
  [instruction.bvid, instruction.cid]
    .filter((id): id is string | number => id !== undefined && id !== null)
    .map(String)

const canRenderInstruction = (instruction: MarkingInstruction) => {
  const ids = getInstructionIds(instruction)
  for (const id of ids) {
    const podItemElement = getPodItemById(id)
    if (!podItemElement) {
      continue
    }
    if (isHasMultiPagePodItem(podItemElement) && instruction.page !== undefined) {
      return getMultiPagePodItemPageItem(podItemElement, instruction.page) !== null
    }
    return true
  }
  return false
}

const waitForRenderableMarkings = async (instructions: MarkingInstruction[]) => {
  if (instructions.length === 0) {
    return
  }
  await sq(
    () => {
      const root = getVideoPodElement()
      if (!root) {
        return null
      }
      return instructions.some(canRenderInstruction) ? root : null
    },
    root => root !== null,
    {
      maxRetry: 8,
      queryInterval: 50,
    },
  )
}

const applyInstruction = (instruction: MarkingInstruction) => {
  const ids = [instruction.bvid, instruction.cid]
    .filter((id): id is string | number => id !== undefined && id !== null)
    .map(String)
  if (ids.length === 0) {
    logger.warn('applyInstruction skipped: empty instruction id.', instruction)
    return false
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
    return false
  }

  const markingClass = instruction.type === 'last-played' ? lastClass : watchedClass
  if (isHasMultiPagePodItem(podItemElement) && instruction.page !== undefined) {
    podItemElement.classList.add(multiPagePodItemClass, markingClass)
    logger.log('multipage podItemElement', podItemElement)
    const pageItemElement = getMultiPagePodItemPageItem(podItemElement, instruction.page)
    if (pageItemElement) {
      pageItemElement.classList.add(markingClass)
      return true
    }
    return false
  }

  podItemElement.classList.add(markingClass)
  return true
}

const runRender = (instructions: MarkingInstruction[]) => {
  frame = 0
  clearMarks()
  let appliedCount = 0
  for (const instruction of instructions) {
    if (applyInstruction(instruction)) {
      appliedCount++
    }
  }
  applyMultiPageCompletionState()
  return {
    appliedCount,
    totalCount: instructions.length,
  }
}

const abortRunningRender = () => {
  renderToken++
  if (frame !== 0) {
    cancelAnimationFrame(frame)
    frame = 0
  }
}

export const clearMarkings = () => {
  abortRunningRender()
  styleToken++
  clearMarks()
  const root = getVideoPodElement()
  root?.classList.remove(styleDefaultClass, styleDistinguishClass)
}

export const setMarkingStyle = (style: MarkingStyle) => {
  const currentStyleToken = ++styleToken
  sq(
    () => getVideoPodElement(),
    root => root !== null,
    {
      maxRetry: 8,
      queryInterval: 100,
    },
  ).then(root => {
    if (!root || currentStyleToken !== styleToken) {
      return
    }
    root.classList.remove(styleDefaultClass, styleDistinguishClass)
    root.classList.add(
      style === MarkingStyle.Distinguish ? styleDistinguishClass : styleDefaultClass,
    )
    logger.log('setMarkingStyle root', root)
  })
}

export const renderMarkings = (instructions: MarkingInstruction[]) => {
  abortRunningRender()
  const currentRenderToken = renderToken
  waitForRenderableMarkings(instructions).then(async () => {
    if (currentRenderToken !== renderToken) {
      return
    }
    await sq(
      () => {
        if (currentRenderToken !== renderToken) {
          return {
            appliedCount: 0,
            totalCount: 0,
          }
        }
        return runRender(instructions)
      },
      (result, stop) => {
        if (currentRenderToken !== renderToken) {
          stop()
          return true
        }
        return result.totalCount === 0 || result.appliedCount > 0
      },
      {
        maxRetry: 8,
        queryInterval: 100,
      },
    )
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

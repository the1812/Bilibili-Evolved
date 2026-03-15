import type {
  VideoDataChangeDetail,
  VideoDataChangeEpisode,
  VideoDataChangePage,
} from '@/core/observer'
import { clickInstructionTarget } from './dom'
import { getLastPlayedInstruction } from './marking'
import { SectionMode, type ComponentMemory, type MarkingInstruction } from './types'

export type JumpInstruction = Pick<MarkingInstruction, 'bvid' | 'cid' | 'page'>
type CollectionTarget = {
  episode?: VideoDataChangeEpisode
  page?: VideoDataChangePage
  pageIndex?: number
  episodeOrder: number
  episodeIndex: number
}

const normalizeText = (text?: string) => text?.trim() || undefined

const getPageIndexLabel = (page?: number) => (page ? `第 ${page} P` : undefined)

const getCollectionPageTitle = (page?: VideoDataChangePage) =>
  normalizeText(page?.part) ?? normalizeText(page?.title)

const findMultiPageTarget = (detail: VideoDataChangeDetail, instruction: JumpInstruction) => {
  const pages = detail.videoData?.pages ?? []
  const matchedPageIndex = pages.findIndex(page => page.cid === instruction.cid)
  if (matchedPageIndex >= 0) {
    return {
      page: pages[matchedPageIndex],
      pageIndex: matchedPageIndex + 1,
    }
  }
  if (instruction.page && instruction.page > 0) {
    return {
      page: pages[instruction.page - 1],
      pageIndex: instruction.page,
    }
  }
  return {
    page: undefined,
    pageIndex: instruction.page,
  }
}

export const isSameInstruction = (
  currentInstruction?: JumpInstruction,
  targetInstruction?: JumpInstruction,
) =>
  currentInstruction?.bvid === targetInstruction?.bvid &&
  currentInstruction?.cid === targetInstruction?.cid &&
  currentInstruction?.page === targetInstruction?.page

export const isSameAsCurrentMemory = (
  currentMemory: Pick<ComponentMemory, 'bvid' | 'cid' | 'page'>,
  instruction?: JumpInstruction,
) =>
  currentMemory.bvid === instruction?.bvid &&
  currentMemory.cid === instruction?.cid &&
  currentMemory.page === instruction?.page

export const isJumpInstructionValid = (instruction?: JumpInstruction) =>
  instruction !== undefined && (instruction.bvid !== undefined || instruction.cid !== undefined)

const findCollectionTarget = (detail: VideoDataChangeDetail, instruction: JumpInstruction) => {
  const sections = detail.sectionsInfo?.sections ?? []
  let episodeOrder = 0
  let episodeIndex = -1
  let fallbackMatch: CollectionTarget | undefined

  for (const section of sections) {
    for (const episode of section.episodes ?? []) {
      episodeOrder++
      episodeIndex++
      const pages = episode.pages ?? []
      const matchedPageIndex = pages.findIndex(page => page.cid === instruction.cid)
      if (matchedPageIndex >= 0) {
        return {
          episode,
          page: pages[matchedPageIndex],
          pageIndex: matchedPageIndex + 1,
          episodeOrder,
          episodeIndex,
        }
      }
      if (!fallbackMatch && instruction.bvid && episode.bvid === instruction.bvid) {
        fallbackMatch = {
          episode,
          page:
            instruction.page && instruction.page > 0
              ? episode.pages?.[instruction.page - 1]
              : undefined,
          pageIndex: instruction.page,
          episodeOrder,
          episodeIndex,
        }
      }
    }
  }

  return fallbackMatch
}

export const getInstructionLabel = (
  instruction: JumpInstruction,
  detail: VideoDataChangeDetail,
) => {
  const hasSections = (detail.sectionsInfo?.sections?.length ?? 0) > 0
  if (!hasSections) {
    const target = findMultiPageTarget(detail, instruction)
    const pageTitle = getCollectionPageTitle(target.page)
    const pageIndexLabel = getPageIndexLabel(target.pageIndex)
    if (pageTitle && pageIndexLabel) {
      return `${pageIndexLabel} - ${pageTitle}`
    }
    return pageTitle ?? pageIndexLabel ?? instruction.bvid ?? String(instruction.cid ?? '')
  }

  const target = findCollectionTarget(detail, instruction)
  const episodeTitle = normalizeText(target?.episode?.title)
  const pageTitle = getCollectionPageTitle(target?.page)
  const pageCount = target?.episode?.pages?.length
  const shouldShowPageIndex = pageCount === undefined || pageCount > 1
  const pageIndexLabel = shouldShowPageIndex
    ? getPageIndexLabel(target?.pageIndex ?? instruction.page)
    : undefined

  if (episodeTitle && pageTitle && pageTitle !== episodeTitle) {
    return `《${episodeTitle}》 - ${pageTitle}`
  }
  if (episodeTitle && pageIndexLabel) {
    return `《${episodeTitle}》的${pageIndexLabel}`
  }
  if (episodeTitle) {
    return `《${episodeTitle}》`
  }
  if (pageTitle) {
    const episodeLabel = target?.episodeOrder ? `第 ${target.episodeOrder} 个视频` : '目标视频'
    return `${episodeLabel} - ${pageTitle}`
  }
  if (pageIndexLabel) {
    const episodeLabel = target?.episodeOrder ? `第 ${target.episodeOrder} 个视频` : '目标视频'
    return `${episodeLabel}的${pageIndexLabel}`
  }
  return instruction.bvid ?? String(instruction.cid ?? '')
}

const getNextInstructionInMultiPage = (
  detail: VideoDataChangeDetail,
  instruction: JumpInstruction,
): JumpInstruction | undefined => {
  const pages = detail.videoData?.pages ?? []
  if (pages.length <= 1) {
    return undefined
  }
  const currentIndexByCid = pages.findIndex(page => page.cid === instruction.cid)
  let currentIndex = currentIndexByCid
  if (currentIndex < 0) {
    currentIndex = instruction.page && instruction.page > 0 ? instruction.page - 1 : -1
  }
  const nextPage = pages[currentIndex + 1]
  if (!nextPage?.cid) {
    return undefined
  }
  return {
    bvid: detail.bvid,
    cid: nextPage.cid,
    page: currentIndex + 2,
  }
}

const getNextInstructionInCollection = (
  detail: VideoDataChangeDetail,
  instruction: JumpInstruction,
): JumpInstruction | undefined => {
  const episodes = detail.sectionsInfo?.sections?.flatMap(section => section.episodes ?? []) ?? []
  const target = findCollectionTarget(detail, instruction)
  const episode = target?.episode
  if (!target || !episode) {
    return undefined
  }

  const pages = episode.pages ?? []
  const currentPageIndex =
    typeof target.pageIndex === 'number' && target.pageIndex > 0 ? target.pageIndex - 1 : -1
  if (pages.length > 1 && currentPageIndex >= 0 && currentPageIndex < pages.length - 1) {
    const nextPage = pages[currentPageIndex + 1]
    if (nextPage?.cid === undefined) {
      return undefined
    }
    return {
      bvid: episode.bvid ?? instruction.bvid,
      cid: nextPage.cid,
      page: currentPageIndex + 2,
    }
  }

  const nextEpisode = episodes[target.episodeIndex + 1]
  if (!nextEpisode) {
    return undefined
  }
  const nextEpisodePages = nextEpisode.pages ?? []
  const firstPage = nextEpisodePages[0]
  if (nextEpisode.bvid === undefined && firstPage?.cid === undefined) {
    return undefined
  }
  return {
    bvid: nextEpisode.bvid,
    cid: firstPage?.cid,
    page: nextEpisodePages.length > 1 ? 1 : undefined,
  }
}

export const getNextInstruction = (
  instruction: JumpInstruction,
  detail: VideoDataChangeDetail,
): JumpInstruction | undefined => {
  const hasSections = (detail.sectionsInfo?.sections?.length ?? 0) > 0
  return hasSections
    ? getNextInstructionInCollection(detail, instruction)
    : getNextInstructionInMultiPage(detail, instruction)
}

const getInstructionUrl = (instruction: JumpInstruction) => {
  const pageQuery = instruction.page && instruction.page > 1 ? `?p=${instruction.page}` : ''
  return `https://www.bilibili.com/video/${instruction.bvid}/${pageQuery}`
}

const redirectToInstruction = (instruction: JumpInstruction) => {
  if (!instruction.bvid) {
    return false
  }
  window.location.assign(getInstructionUrl(instruction))
  return true
}

export const jumpToInstruction = (instruction: JumpInstruction) => {
  const clickSucceeded = clickInstructionTarget(instruction)
  if (clickSucceeded) {
    return true
  }
  return redirectToInstruction(instruction)
}

export const resolveJumpTargets = ({
  currentInstructions,
  currentMemory,
  currentDetail,
  sectionMode,
}: {
  currentInstructions: MarkingInstruction[]
  currentMemory?: ComponentMemory | null
  currentDetail: VideoDataChangeDetail
  sectionMode: SectionMode
}) => {
  if (!currentMemory) {
    return {
      lastPlayedInstruction: undefined,
      lastPlayedLabel: undefined,
      nextInstruction: undefined,
      nextLabel: undefined,
      canJumpLast: false,
      canJumpNext: false,
    }
  }

  const lastPlayedInstruction = getLastPlayedInstruction(
    currentInstructions,
    currentMemory,
    sectionMode,
  )
  const nextInstructionCandidate = lastPlayedInstruction
    ? getNextInstruction(lastPlayedInstruction, currentDetail)
    : undefined
  const nextInstruction = isJumpInstructionValid(nextInstructionCandidate)
    ? nextInstructionCandidate
    : undefined

  return {
    lastPlayedInstruction,
    lastPlayedLabel: lastPlayedInstruction
      ? getInstructionLabel(lastPlayedInstruction, currentDetail)
      : undefined,
    nextInstruction,
    nextLabel: nextInstruction ? getInstructionLabel(nextInstruction, currentDetail) : undefined,
    canJumpLast: Boolean(
      lastPlayedInstruction && !isSameAsCurrentMemory(currentMemory, lastPlayedInstruction),
    ),
    canJumpNext: Boolean(
      lastPlayedInstruction &&
        nextInstruction &&
        !isSameInstruction(nextInstruction, lastPlayedInstruction) &&
        !isSameAsCurrentMemory(currentMemory, nextInstruction),
    ),
  }
}

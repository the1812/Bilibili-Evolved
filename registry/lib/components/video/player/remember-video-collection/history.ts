import { VideoDataChangeDetail } from '@/core/observer'
import {
  SectionMode,
  type ComponentHistory,
  type ComponentMemory,
  type ComponentOptions,
  type HistoryScope,
} from './types'

const getPageByCid = (pages: Array<{ cid?: number }> | undefined, cid: number) => {
  if ((pages?.length ?? 0) <= 1) {
    return undefined
  }
  const pageIndex = pages?.findIndex(page => page.cid === cid) ?? -1
  if (pageIndex < 0) {
    return undefined
  }
  return pageIndex + 1
}

const findTargetEpisode = (detail: VideoDataChangeDetail) => {
  const { bvid, cid, sectionsInfo } = detail
  const episodes = sectionsInfo?.sections?.flatMap(section => section.episodes ?? []) ?? []

  return (
    episodes.find(episode => (episode.pages ?? []).some(page => page.cid === cid)) ??
    episodes.find(episode => episode.bvid === bvid)
  )
}

const getCurrentPage = (state: VideoDataChangeDetail): number | undefined => {
  if (typeof state.cid !== 'number') {
    return undefined
  }
  return (
    getPageByCid(state.videoData?.pages, state.cid) ??
    getPageByCid(findTargetEpisode(state)?.pages, state.cid)
  )
}

const findTargetSection = (detail: VideoDataChangeDetail) => {
  const { sectionsInfo } = detail
  const targetEpisode = findTargetEpisode(detail)
  if (!targetEpisode) {
    return undefined
  }

  return sectionsInfo?.sections?.find(section =>
    (section.episodes ?? []).some(episode => episode === targetEpisode),
  )
}

const getSectionInfo = (detail: VideoDataChangeDetail) => {
  const { sectionsInfo } = detail
  if (lodash.isEmpty(sectionsInfo)) {
    return {
      sectionId: undefined,
      sectionRootId: undefined,
      sectionsCount: 0,
    }
  }

  return {
    sectionId: findTargetSection(detail)?.id,
    sectionRootId: sectionsInfo?.id,
    sectionsCount: sectionsInfo?.sections?.length ?? 0,
  }
}

const normalizeText = (text?: string) => text?.trim() || undefined

export const buildCurrentMemory = (state: VideoDataChangeDetail): ComponentMemory | null => {
  if (!state.bvid || typeof state.cid !== 'number') {
    return null
  }
  const { sectionId, sectionRootId } = getSectionInfo(state)

  return {
    bvid: state.bvid,
    cid: state.cid,
    page: getCurrentPage(state),
    sectionId,
    sectionRootId,
    timestamp: Date.now(),
  }
}

export const getHistoryScope = (detail: VideoDataChangeDetail): HistoryScope | null => {
  const { bvid, videoData } = detail
  const { sectionRootId, sectionsCount } = getSectionInfo(detail)
  if (sectionsCount === 0) {
    if ((videoData?.pages?.length ?? 0) > 1) {
      // 普通多P视频
      return { bvid, type: 'multi-p' }
    }
    // 单P普通视频
    return null
  }
  if (sectionsCount > 1) {
    return { sectionRootId, type: 'multi-sections' }
  }
  // 普通合集视频
  return { sectionRootId, type: 'sections' }
}

export const filterHistory = (history: ComponentHistory, scope: HistoryScope): ComponentHistory => {
  if (!Array.isArray(history) || history.length === 0 || !scope) {
    return []
  }

  if (scope.type === 'multi-p') {
    return history.filter(memory => memory.bvid === scope.bvid)
  }

  if (scope.type === 'sections') {
    if (scope.sectionRootId === undefined) {
      return []
    }
    return history.filter(memory => memory.sectionRootId === scope.sectionRootId)
  }

  if (scope.type === 'multi-sections') {
    if (scope.sectionRootId !== undefined) {
      return history.filter(memory => memory.sectionRootId === scope.sectionRootId)
    }
    if (scope.sectionId !== undefined) {
      return history.filter(memory => memory.sectionId === scope.sectionId)
    }
    return []
  }

  return []
}

const isMemoryInHistoryScope = (
  memory: Pick<ComponentMemory, 'bvid' | 'sectionId' | 'sectionRootId'>,
  scope: HistoryScope,
) => {
  if (scope.type === 'multi-p') {
    return memory.bvid === scope.bvid
  }
  if (scope.type === 'sections' || scope.type === 'multi-sections') {
    return scope.sectionRootId !== undefined && memory.sectionRootId === scope.sectionRootId
  }
  return false
}

export const clearHistoryInScope = (
  history: ComponentHistory,
  scope: HistoryScope | null,
  sectionMode: SectionMode,
  currentMemory?: Pick<ComponentMemory, 'sectionId' | 'sectionRootId'> | null,
) => {
  if (!scope) {
    return history
  }

  const clearCurrentSectionOnly =
    sectionMode === SectionMode.Split &&
    scope.type === 'multi-sections' &&
    currentMemory?.sectionRootId !== undefined &&
    currentMemory.sectionId !== undefined

  if (clearCurrentSectionOnly) {
    return history.filter(
      memory =>
        !(
          memory.sectionRootId === currentMemory.sectionRootId &&
          memory.sectionId === currentMemory.sectionId
        ),
    )
  }

  return history.filter(memory => !isMemoryInHistoryScope(memory, scope))
}

export const getHistoryInScope = (
  history: ComponentHistory,
  scope: HistoryScope | null,
  sectionMode: SectionMode,
  currentMemory?: Pick<ComponentMemory, 'sectionId' | 'sectionRootId'> | null,
) => {
  if (!scope) {
    return []
  }

  const clearCurrentSectionOnly =
    sectionMode === SectionMode.Split &&
    scope.type === 'multi-sections' &&
    currentMemory?.sectionRootId !== undefined &&
    currentMemory.sectionId !== undefined

  if (clearCurrentSectionOnly) {
    return history.filter(
      memory =>
        memory.sectionRootId === currentMemory.sectionRootId &&
        memory.sectionId === currentMemory.sectionId,
    )
  }

  return history.filter(memory => isMemoryInHistoryScope(memory, scope))
}

export const getClearHistoryDescription = (
  scope: HistoryScope | null,
  sectionMode: SectionMode,
  currentMemory?: Pick<ComponentMemory, 'sectionId'> | null,
) => {
  if (!scope) {
    return '当前页面没有可管理的播放记忆'
  }
  if (
    sectionMode === SectionMode.Split &&
    scope.type === 'multi-sections' &&
    currentMemory?.sectionId !== undefined
  ) {
    return '将清除当前 TAB 下的播放记忆'
  }
  if (scope.type === 'multi-p') {
    return '将清除当前视频的播放记忆'
  }
  return '将清除当前合集的播放记忆'
}

export const getHistoryScopeLabel = (
  detail: VideoDataChangeDetail | undefined,
  scope: HistoryScope | null,
  sectionMode: SectionMode,
  currentMemory?: Pick<ComponentMemory, 'sectionId'> | null,
) => {
  if (!detail || !scope) {
    return undefined
  }
  if (scope.type === 'multi-p') {
    return normalizeText(detail.videoData?.title)
  }
  if (scope.type === 'sections') {
    return normalizeText(detail.sectionsInfo?.title)
  }
  if (scope.type === 'multi-sections') {
    const sections = detail.sectionsInfo?.sections ?? []
    const matchedSection =
      sections.find(section => section.id === currentMemory?.sectionId) ??
      (currentMemory?.sectionId !== undefined ? sections[currentMemory.sectionId] : undefined)
    if (sectionMode === SectionMode.Split) {
      return normalizeText(matchedSection?.title) ?? normalizeText(detail.sectionsInfo?.title)
    }
    return normalizeText(detail.sectionsInfo?.title)
  }
  return undefined
}

export const sortHistory = (history: ComponentHistory) => {
  // 按 timestamp 进行排序，最新的排在末尾
  return history.sort((a, b) => a.timestamp - b.timestamp)
}

const getMemoryKey = (
  memory: Pick<ComponentMemory, 'bvid' | 'cid' | 'page' | 'sectionId' | 'sectionRootId'>,
) =>
  [
    memory.bvid,
    memory.cid,
    memory.page ?? '',
    memory.sectionId ?? '',
    memory.sectionRootId ?? '',
  ].join('|')

export const upsertHistory = (
  history: ComponentOptions['history'],
  memory: ComponentMemory,
): ComponentOptions['history'] => {
  const memoryKey = getMemoryKey(memory)
  const filtered = history.filter(item => getMemoryKey(item) !== memoryKey)
  return [...filtered, memory]
}

/** Vue 弹窗宿主：挂载搜索 / 管理 / 预览弹窗与角标，由 runtime 注入引擎与 API */
import Vue from 'vue'
import { mountVueComponent } from '@/core/utils'
import { dmWarn } from '../danmaku/log'
import {
  MANAGER_MODAL_EVENTS,
  MERGER_COUNT_BADGE_EVENTS,
  MERGER_MODAL_EVENTS,
  PREVIEW_MODAL_EVENTS,
  type MergerBatchMergeItem,
  type MergerManagerGroup,
  type MergerOffsetType,
  type MergerPreviewItem,
  type MergerSearchVideo,
  type MergerSourceSummary,
  type MergerUiHost,
  type PagePartListRow,
} from './contracts'
import {
  destroyMergerConfirm,
  mergerConfirm,
  mergerProgressToast,
  mergerProgressToastDone,
  mergerToast,
} from './notify'
import { getCurrentPageCid, sourceMatchesViewCid } from '../runtime/helpers'
import { normalizeHttpsUrl } from './shared/media-url'

const PREVIEW_PAGE_SIZE = 50

export interface MergerEngineSource {
  id: string
  bvid?: string
  title?: string
  pic?: string
  author?: string
  groupTitle?: string
  count?: number
  offset?: number
  cid?: number | string
  viewCid?: number | string
  aid?: number | string
  fetchMode?: string
  fetchNotice?: string
}

export interface MergerVueHostDeps {
  engine: {
    getSources: () => MergerEngineSource[]
    getCurrentVideoId: () => string
    removeSource: (id: string) => void
    updateSource: (id: string, updates: Record<string, unknown>) => void
    sources?: Map<string, { list: Array<{ time: number; text: string }>; meta: MergerEngineSource }>
  }
  api: {
    search: (
      keyword: string,
      page: number,
    ) => Promise<Array<{ result_type: string; data: MergerSearchVideo[] }>>
    getView: (id: string) => Promise<{
      bvid: string
      title: string
      pic: string
      owner?: { name: string }
      pages?: Array<{ cid: number; part: string; page: number; duration?: number }>
    }>
    getDanmaku: (
      cid: number | string,
      options?: {
        videoId?: string
        aid?: number | string
        forceFallback?: boolean
        unavailableReason?: string
      },
    ) => Promise<{
      list: Array<{ time: number; text: string }>
      mode: string
      notice?: string
    }>
    getPageList: (bvid: string) => Promise<Array<{ cid: number; duration?: number }>>
  }
  parseDanmaku: (xml: string) => Array<{ time: number; text: string }>
  injectDanmaku: (
    list: Array<{ time: number; text: string }>,
    meta: Record<string, unknown>,
    silent?: boolean,
    onProgress?: (phase: string) => void,
  ) => Promise<{
    ok: boolean
    count: number
    screen: number
    list: boolean
    reason?: string
  }>
  extractBvid: (raw: string) => string
  resolveSourceBvid: (source: MergerEngineSource) => string
  formatDurationShort: (seconds: number) => string
  parseDurationText: (text: string | null | undefined) => number | null
  loadPartModeState: (bvid: string) => { total?: string; uniform?: string } | null
  savePartModeState: (bvid: string, state: { total?: string; uniform?: string }) => void
  hasListStore: () => boolean
  formatInjectHint: (result: {
    count: number
    screen: number
    list: boolean
    firstSec?: number | null
  }) => string
  onSourcesUpdated: () => void
}

interface PartModeFields {
  total: string
  uniform: string
  partDurations: Record<number, string>
  userEditedParts: Set<number>
  hint: string
}

interface SearchUiState {
  visible: boolean
  keyword: string
  loading: boolean
  loadingMore: boolean
  results: MergerSearchVideo[]
  selectedBvids: string[]
  /** 跨搜索保留已选视频卡片信息（bvid → 摘要） */
  selectedVideos: Record<string, MergerSearchVideo>
  expandedBvids: Record<string, boolean>
  expandedPages: Record<string, PagePartListRow[]>
  sortMode: 'default' | 'play' | 'danmaku'
  errorMessage: string
  hasMore: boolean
  currentKeyword: string
  currentPage: number
  partModeEnabled: Record<string, boolean>
  partModeFields: Record<string, PartModeFields>
}

interface ManagerUiState {
  visible: boolean
  groups: MergerManagerGroup[]
  selectedIds: string[]
  expandedGroups: string[]
}

interface PreviewUiState {
  visible: boolean
  title: string
  items: MergerPreviewItem[]
  displayedCount: number
  sortOrder: 1 | -1
  fullList: Array<{ time: number; text: string }>
}

function defaultPartModeFields(
  bvid: string,
  load: MergerVueHostDeps['loadPartModeState'],
): PartModeFields {
  const saved = load(bvid)
  return {
    total: saved?.total || '',
    uniform: saved?.uniform || '',
    partDurations: {},
    userEditedParts: new Set(),
    hint: '',
  }
}

function buildManagerGroups(
  sources: MergerEngineSource[],
  extractBvid: MergerVueHostDeps['extractBvid'],
  resolveBvid: MergerVueHostDeps['resolveSourceBvid'],
): MergerManagerGroup[] {
  const groups: Record<string, MergerManagerGroup> = {}

  sources.forEach(source => {
    const resolvedBvid = resolveBvid(source)
    const key = resolvedBvid || source.id || 'other'
    if (!groups[key]) {
      groups[key] = {
        groupKey: key,
        bvid: resolvedBvid,
        title: source.groupTitle || source.title || '未知视频',
        cover: normalizeHttpsUrl(source.pic || ''),
        author: source.author || '',
        items: [],
      }
    }
    if (!groups[key].bvid && resolvedBvid) {
      groups[key].bvid = resolvedBvid
    }
    groups[key].items.push({
      id: source.id,
      bvid: resolvedBvid || source.bvid || '',
      title: source.title || '',
      count: source.count || 0,
      offset: source.offset,
      fetchMode: source.fetchMode,
      fetchNotice: source.fetchNotice,
    })
  })

  return Object.values(groups)
}

export interface MergerVueHostCtrl {
  host: MergerUiHost
  mount: () => Promise<void>
  handleVideoChange: () => void
  handlePartChange: () => void
  destroy: () => void
  refreshBadge: () => void
}

export const createMergerVueHost = (deps: MergerVueHostDeps): MergerVueHostCtrl => {
  const searchState: SearchUiState = {
    visible: false,
    keyword: '',
    loading: false,
    loadingMore: false,
    results: [],
    selectedBvids: [],
    selectedVideos: {},
    expandedBvids: {},
    expandedPages: {},
    sortMode: 'default',
    errorMessage: '',
    hasMore: true,
    currentKeyword: '',
    currentPage: 1,
    partModeEnabled: {},
    partModeFields: {},
  }

  const managerState: ManagerUiState = {
    visible: false,
    groups: [],
    selectedIds: [],
    expandedGroups: [],
  }

  const previewState: PreviewUiState = {
    visible: false,
    title: '',
    items: [],
    displayedCount: 0,
    sortOrder: 1,
    fullList: [],
  }

  let searchVm: (Vue & SearchUiState) | null = null
  let managerVm: (Vue & ManagerUiState) | null = null
  let previewVm: (Vue & PreviewUiState) | null = null
  let badgeVm: Vue | null = null
  let handleBadgeOpen: (() => void) | null = null

  const cloneExpandedPages = () =>
    Object.fromEntries(
      Object.entries(searchState.expandedPages).map(([bvid, pages]) => [
        bvid,
        pages.map(page => ({ ...page })),
      ]),
    )

  const normalizeSearchVideo = (video: MergerSearchVideo): MergerSearchVideo => ({
    ...video,
    pic: normalizeHttpsUrl(video.pic),
  })

  /** 当前已合并源的 BV 集合（搜索列表打标用） */
  const getMergedBvidSet = (): Set<string> => {
    const set = new Set<string>()
    deps.engine.getSources().forEach(source => {
      const bvid = deps.resolveSourceBvid(source) || source.bvid || ''
      if (bvid) {
        set.add(String(bvid))
      }
    })
    return set
  }

  /** 当前已合并源的 cid 集合（分 P 行打标用） */
  const getMergedCidSet = (): Set<string> => {
    const set = new Set<string>()
    deps.engine.getSources().forEach(source => {
      if (source.cid != null && source.cid !== '') {
        set.add(String(source.cid))
      }
      // id 形如 BVxxx_cid
      const fromId = String(source.id || '').match(/_(\d+)$/)
      if (fromId?.[1]) {
        set.add(fromId[1])
      }
    })
    return set
  }

  /** 已合并源条数按 BV 汇总，供搜索卡展示 */
  const getMergedCountByBvid = (): Record<string, number> => {
    const map: Record<string, number> = {}
    deps.engine.getSources().forEach(source => {
      const bvid = deps.resolveSourceBvid(source) || source.bvid || ''
      if (!bvid) {
        return
      }
      map[bvid] = (map[bvid] || 0) + 1
    })
    return map
  }

  /** 给分 P 行打上 merged 标记 */
  const markMergedPages = (pages: PagePartListRow[]): PagePartListRow[] => {
    const mergedCids = getMergedCidSet()
    return pages.map(page => ({
      ...page,
      merged: mergedCids.has(String(page.cid)),
    }))
  }

  /** 记住已选视频摘要，换关键词后底部仍可查看/合并 */
  const rememberSelectedVideos = (videos: MergerSearchVideo[]): void => {
    videos.forEach(video => {
      if (!video?.bvid) {
        return
      }
      searchState.selectedVideos[video.bvid] = normalizeSearchVideo(video)
    })
  }

  /** 选中列表变化时同步摘要字典，去掉已取消项 */
  const syncSelectedVideoCache = (selectedBvids: string[]): void => {
    const next: Record<string, MergerSearchVideo> = {}
    selectedBvids.forEach(bvid => {
      const cached = searchState.selectedVideos[bvid]
      const fromResults = searchState.results.find(item => item.bvid === bvid)
      if (fromResults) {
        next[bvid] = normalizeSearchVideo(fromResults)
        return
      }
      if (cached) {
        next[bvid] = cached
      }
    })
    searchState.selectedVideos = next
  }

  const selectedVideosList = (): MergerSearchVideo[] =>
    searchState.selectedBvids
      .map(bvid => searchState.selectedVideos[bvid])
      .filter((item): item is MergerSearchVideo => !!item)

  const applySearchSort = (
    results: MergerSearchVideo[],
    mode: SearchUiState['sortMode'],
  ): MergerSearchVideo[] => {
    const list = [...results]
    if (mode === 'play') {
      return list.sort((a, b) => (b.play || 0) - (a.play || 0))
    }
    if (mode === 'danmaku') {
      return list.sort((a, b) => (b.video_review || 0) - (a.video_review || 0))
    }
    return list
  }

  const isSameSearchResults = (
    current: MergerSearchVideo[],
    next: MergerSearchVideo[],
  ): boolean => {
    if (current.length !== next.length) {
      return false
    }
    return current.every((item, index) => item.bvid === next[index]?.bvid)
  }

  const syncExpandedPagesToVm = (bvid?: string) => {
    if (!searchVm) {
      return
    }
    if (bvid) {
      const pages = searchState.expandedPages[bvid]
      if (pages) {
        Vue.set(
          searchVm.$data.expandedPages,
          bvid,
          pages.map(page => ({ ...page })),
        )
      } else {
        Vue.delete(searchVm.$data.expandedPages, bvid)
      }
      return
    }
    Vue.set(searchVm.$data, 'expandedPages', cloneExpandedPages())
  }

  const syncSearchVm = () => {
    if (!searchVm) {
      return
    }
    // 源列表变化时，刷新已展开分P的 merged 标记
    Object.keys(searchState.expandedPages).forEach(bvid => {
      const pages = searchState.expandedPages[bvid]
      if (pages?.length) {
        searchState.expandedPages[bvid] = markMergedPages(pages)
      }
    })
    const data = searchVm.$data as Record<string, unknown>
    const currentResults = (data.results as MergerSearchVideo[]) || []
    const nextResults = searchState.results

    Vue.set(data, 'visible', searchState.visible)
    Vue.set(data, 'keyword', searchState.keyword)
    Vue.set(data, 'loading', searchState.loading)
    Vue.set(data, 'loadingMore', searchState.loadingMore)
    if (!isSameSearchResults(currentResults, nextResults)) {
      Vue.set(data, 'results', [...nextResults])
    }
    Vue.set(data, 'selectedBvids', [...searchState.selectedBvids])
    Vue.set(data, 'selectedVideos', selectedVideosList())
    Vue.set(data, 'expandedBvids', { ...searchState.expandedBvids })
    Vue.set(data, 'expandedPages', cloneExpandedPages())
    Vue.set(data, 'sortMode', searchState.sortMode)
    Vue.set(data, 'errorMessage', searchState.errorMessage)
    Vue.set(data, 'hasMore', searchState.hasMore)
    // 已合并 BV 标记，供搜索列表与底部已选区展示
    Vue.set(data, 'mergedBvids', Array.from(getMergedBvidSet()))
    Vue.set(data, 'mergedCountByBvid', getMergedCountByBvid())
    // 不在这里写 searchInput：输入框由用户编辑，避免同步时被预填标题冲掉
  }

  const syncManagerVm = () => {
    if (!managerVm) {
      return
    }
    Vue.set(managerVm.$data, 'visible', managerState.visible)
    Vue.set(
      managerVm.$data,
      'groups',
      managerState.groups.map(group => ({
        ...group,
        items: group.items.map(item => ({ ...item })),
      })),
    )
    Vue.set(managerVm.$data, 'selectedIds', [...managerState.selectedIds])
    Vue.set(managerVm.$data, 'expandedGroups', [...managerState.expandedGroups])
  }

  const syncPreviewVm = () => {
    if (!previewVm) {
      return
    }
    Object.assign(previewVm.$data, {
      visible: previewState.visible,
      title: previewState.title,
      items: [...previewState.items],
      displayedCount: previewState.displayedCount,
      sortOrder: previewState.sortOrder,
      hasMore: previewState.displayedCount < previewState.fullList.length,
    })
  }

  const wireBadgeOpen = () => {
    if (!badgeVm || !handleBadgeOpen) {
      return
    }
    badgeVm.$off(MERGER_COUNT_BADGE_EVENTS.OPEN)
    badgeVm.$on(MERGER_COUNT_BADGE_EVENTS.OPEN, handleBadgeOpen)
  }

  const getBadgeSources = () => {
    const viewCid = getCurrentPageCid()
    const sources = deps.engine.getSources()
    if (!viewCid) {
      return sources
    }
    return sources.filter(source => sourceMatchesViewCid(source, viewCid))
  }

  const refreshBadge = () => {
    const sources = getBadgeSources()
    const totalCount = sources.reduce((acc, s) => acc + (s.count || 0), 0)
    if (!badgeVm) {
      return
    }

    Object.assign(badgeVm.$data, {
      totalCount,
      sourceCount: sources.length,
      visible: totalCount > 0,
    })

    const metaContainer =
      document.querySelector('.video-info-container .video-info-meta') ||
      document.querySelector('.video-data') ||
      document.querySelector('.bangumi-info .info-right')

    if (!metaContainer || totalCount === 0) {
      badgeVm.$el?.parentNode?.removeChild(badgeVm.$el)
      return
    }

    if (badgeVm.$el.parentNode !== metaContainer) {
      const spans = metaContainer.querySelectorAll('span')
      const refNode = spans.length >= 2 ? spans[1].nextSibling : null
      if (refNode) {
        metaContainer.insertBefore(badgeVm.$el, refNode)
      } else {
        metaContainer.appendChild(badgeVm.$el)
      }
    }

    wireBadgeOpen()
    Vue.nextTick(() => {
      const el = badgeVm?.$el as HTMLElement | null
      if (!el || el.nodeType !== Node.ELEMENT_NODE) {
        return
      }
      el.onclick = (event: MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()
        handleBadgeOpen?.()
      }
    })
  }

  const refreshManagerGroups = () => {
    managerState.groups = buildManagerGroups(
      deps.engine.getSources(),
      deps.extractBvid,
      deps.resolveSourceBvid,
    )
    managerState.selectedIds = []
    syncManagerVm()
    refreshBadge()
    deps.onSourcesUpdated()
  }

  const getInitialKeyword = (): string => {
    const candidates = [
      document.querySelector('.video-title')?.getAttribute('title'),
      document.querySelector('.video-title')?.textContent,
      document.querySelector('h1.video-title, h1[title], .video-info-title')?.getAttribute('title'),
      document.querySelector('h1.video-title, h1[title], .video-info-title')?.textContent,
      document.querySelector(
        '.video-pod__item.active .title-txt, .video-pod__item.active .title, .multipage-list .on .part, .page-list .on',
      )?.textContent,
      document.title
        .replace(/_哔哩哔哩_bilibili.*$/, '')
        .replace(/-哔哩哔哩.*$/, '')
        .replace(/_哔哩哔哩.*$/, ''),
    ]
    for (const raw of candidates) {
      const title = String(raw || '')
        .replace(/\s+/g, ' ')
        .trim()
      if (title) {
        return title
      }
    }
    return ''
  }

  const resolvePartDurations = (
    bvid: string,
    pages: PagePartListRow[],
    fields: PartModeFields,
  ): number[] => {
    const uniformSec = deps.parseDurationText(fields.uniform)
    const totalSec = deps.parseDurationText(fields.total)
    const rowSecs = pages.map(page => deps.parseDurationText(fields.partDurations[page.cid]))

    if (uniformSec != null && uniformSec > 0) {
      return pages.map(() => uniformSec)
    }
    if (rowSecs.some(v => v != null && v > 0)) {
      return rowSecs.map(v => (v != null && v > 0 ? v : 0))
    }
    if (totalSec != null && totalSec > 0 && pages.length > 0) {
      return pages.map(() => totalSec / pages.length)
    }
    return pages.map(() => 0)
  }

  const applyPartModeOffsets = (bvid: string, silent = false): boolean => {
    const pages = searchState.expandedPages[bvid]
    const fields = searchState.partModeFields[bvid]
    if (!pages || !fields || !searchState.partModeEnabled[bvid]) {
      return false
    }

    const durations = resolvePartDurations(bvid, pages, fields)
    let cumulative = 0
    let valid = false
    let firstChecked = true
    const offsetSummary: string[] = []

    const updated = pages.map((page, idx) => {
      const next = { ...page }
      if (!next.selected) {
        next.offset = 0
        next.offsetType = 1
        next.offsetPreview = ''
        return next
      }

      const dur = durations[idx] || 0
      const offset = firstChecked ? 0 : cumulative
      if (dur > 0) {
        valid = true
        cumulative += dur
        firstChecked = false
      }

      next.offset = Math.round(offset * 10) / 10
      next.offsetType = 1
      const pageNo = page.page || idx + 1
      offsetSummary.push(`P${pageNo}→${offset === 0 ? '0秒' : deps.formatDurationShort(offset)}`)

      if (dur > 0) {
        next.offsetPreview =
          offset === 0
            ? `有效 ${deps.formatDurationShort(dur)} · 顺延 0 秒`
            : `有效 ${deps.formatDurationShort(dur)} · 顺延 ${deps.formatDurationShort(offset)}`
      } else {
        next.offsetPreview = ''
      }

      if (dur > 0 && !fields.userEditedParts.has(page.cid)) {
        fields.partDurations[page.cid] = deps.formatDurationShort(dur)
        next.partDurationText = fields.partDurations[page.cid]
      }

      return next
    })

    searchState.expandedPages[bvid] = updated

    const checkedDurations = durations.filter((_, idx) => updated[idx]?.selected)
    const sum = checkedDurations.reduce((a, b) => a + (b || 0), 0)
    const totalSec = deps.parseDurationText(fields.total)
    let hint = valid
      ? `已计算（仅已选分P）：${offsetSummary.join('，')}`
      : '请填写本集有效时长、每P有效时长，或在下方逐P填写'
    if (valid && totalSec != null && totalSec > 0 && Math.abs(sum - totalSec) > 2) {
      hint += `（已选有效时长合计 ${deps.formatDurationShort(
        sum,
      )} ≠ 本集有效时长 ${deps.formatDurationShort(totalSec)}）`
    }
    fields.hint = hint
    deps.savePartModeState(bvid, { total: fields.total, uniform: fields.uniform })

    if (!silent && valid) {
      mergerToast('有效时长顺延已计算', 'success')
    }

    syncExpandedPagesToVm(bvid)
    return valid
  }

  const fetchDanmakuCounts = async (bvid: string, pages: PagePartListRow[]) => {
    await Promise.all(
      pages.map(async page => {
        try {
          const fetched = await deps.api.getDanmaku(page.cid, { videoId: bvid })
          const list = fetched.list
          page.danmakuCount = list.length
          page.danmakuError = false
        } catch {
          page.danmakuCount = undefined
          page.danmakuError = true
        }
      }),
    )
    searchState.expandedPages[bvid] = markMergedPages(pages)
    syncExpandedPagesToVm(bvid)
  }

  const fetchPageDurations = async (bvid: string, pages: PagePartListRow[]) => {
    try {
      const pageMeta = await deps.api.getPageList(bvid)
      if (!Array.isArray(pageMeta) || !pageMeta.length) {
        return
      }
      const durMap = new Map(pageMeta.map(p => [String(p.cid), p.duration || 0]))
      pages.forEach(page => {
        const sec = durMap.get(String(page.cid)) || 0
        if (sec > 0) {
          page.duration = sec
        }
      })
      searchState.expandedPages[bvid] = markMergedPages(pages)
      syncExpandedPagesToVm(bvid)
    } catch {
      // 忽略片长拉取失败
    }
  }

  const loadVideoPages = async (bvid: string) => {
    searchState.expandedBvids[bvid] = true
    syncSearchVm()

    try {
      const data = await deps.api.getView(bvid)
      const pages: PagePartListRow[] = (data.pages || []).map(p => ({
        cid: p.cid,
        page: p.page,
        part: p.part,
        duration: p.duration,
        selected: searchState.selectedBvids.includes(bvid),
        offset: 0,
        offsetType: 1 as MergerOffsetType,
      }))

      if (!searchState.partModeFields[bvid]) {
        searchState.partModeFields[bvid] = defaultPartModeFields(bvid, deps.loadPartModeState)
      }

      searchState.expandedPages[bvid] = markMergedPages(pages)
      syncSearchVm()

      if (pages.length > 1) {
        fetchPageDurations(bvid, pages)
      }
      fetchDanmakuCounts(bvid, pages)
    } catch (err) {
      mergerToast(`加载分P失败: ${err}`, 'error')
      searchState.expandedBvids[bvid] = false
      delete searchState.expandedPages[bvid]
      syncSearchVm()
    }
  }

  const renderDirectView = async (keyword: string) => {
    searchState.loading = true
    searchState.errorMessage = ''
    searchState.results = []
    searchState.hasMore = false
    // 直接 BV/av 打开时不清空跨搜索已选，便于继续追加
    syncSearchVm()

    try {
      const data = await deps.api.getView(keyword)
      const video: MergerSearchVideo = {
        bvid: data.bvid,
        title: data.title,
        pic: normalizeHttpsUrl(data.pic),
        author: data.owner?.name || '',
      }
      searchState.results = [video]
      rememberSelectedVideos([video])
      await loadVideoPages(data.bvid)
    } catch (err) {
      searchState.errorMessage = String(err)
    } finally {
      searchState.loading = false
      syncSearchVm()
    }
  }

  const doSearch = async (keyword: string, page = 1, append = false) => {
    if (/^(BV|av)/i.test(keyword)) {
      await renderDirectView(keyword)
      return
    }

    if (!append) {
      searchState.loading = true
      searchState.errorMessage = ''
      searchState.results = []
      // 换关键词只刷新结果列表；已选与分P勾选跨搜索保留
      searchState.currentKeyword = keyword
      searchState.currentPage = 1
      searchState.hasMore = true
    } else {
      searchState.loadingMore = true
    }
    syncSearchVm()

    try {
      const result = await deps.api.search(keyword, page)
      const videos = result.find(r => r.result_type === 'video')
      if (videos?.data?.length) {
        const incoming = videos.data.map(normalizeSearchVideo)
        const merged = append ? [...searchState.results, ...incoming] : incoming
        searchState.results = applySearchSort(merged, searchState.sortMode)
        // 新结果若命中已选 bvid，刷新封面/标题摘要
        rememberSelectedVideos(
          incoming.filter(item => searchState.selectedBvids.includes(item.bvid)),
        )
        searchState.hasMore = videos.data.length >= 30
        searchState.currentPage = page
      } else if (!append) {
        searchState.results = []
        searchState.hasMore = false
        searchState.errorMessage = ''
      } else {
        searchState.hasMore = false
      }
    } catch (err) {
      if (!append) {
        searchState.errorMessage = String(err)
      }
    } finally {
      searchState.loading = false
      searchState.loadingMore = false
      syncSearchVm()
    }
  }

  const runBatchMerge = async (items: MergerBatchMergeItem[]) => {
    if (!items.length) {
      mergerToast('未选择任何内容', 'warn')
      return
    }

    const confirmed = await mergerConfirm('批量合并', `即将合并 ${items.length} 项，是否继续？`)
    if (!confirmed) {
      return
    }

    searchState.visible = false
    syncSearchVm()

    let success = 0
    let fail = 0
    let totalDm = 0
    let lastFailReason = ''
    const reasonText: Record<string, string> = {
      player_not_ready: '播放器未就绪',
      no_db: 'DanmakuX 不可用',
      addList_error: 'addList 异常',
      screen_empty: '画面未写入',
      inject_failed: '注入未生效',
    }

    mergerProgressToast(`正在合并 0/${items.length}`)

    const hasSourceId = (sourceId: string) =>
      deps.engine.getSources().some(source => String(source.id) === sourceId)

    try {
      for (const task of items) {
        const sourcesBefore = deps.engine.getSources().length
        let resolvedSourceId = ''
        let resolvedTitle = task.title
        try {
          let { cid, title } = task
          const workingTask = { ...task }

          if (task.fetchRequired) {
            try {
              const data = await deps.api.getView(task.bvid)
              if (data?.pages?.length) {
                cid = data.pages[0].cid
                title = `P1 ${data.pages[0].part}`
                Object.assign(workingTask, {
                  cid,
                  title,
                  pic: normalizeHttpsUrl(data.pic),
                  author: data.owner?.name || '',
                  groupTitle: data.title,
                  aid: (data as { aid?: number | string }).aid,
                })
              } else {
                throw new Error('没有分P数据')
              }
            } catch (viewErr) {
              // 视频已删时 view 失败：若任务已有 cid 仍可走历史弹幕兜底
              if (cid == null) {
                const msg = viewErr instanceof Error ? viewErr.message : String(viewErr)
                throw new Error(
                  /不存在|已删除|404|62002|不可见/i.test(msg)
                    ? '视频不存在或已删除，且缺少 cid 无法兜底'
                    : msg || '获取视频信息失败',
                )
              }
              workingTask.fetchNotice = '视频不存在或已删除，将尝试历史弹幕兜底'
            }
          }

          if (cid == null) {
            throw new Error('缺少 cid')
          }
          resolvedTitle = title
          resolvedSourceId = workingTask.bvid ? `${workingTask.bvid}_${cid}` : String(cid)
          const fetched = await deps.api.getDanmaku(cid, {
            videoId: workingTask.bvid || String(cid),
            aid: workingTask.aid,
            forceFallback: !!workingTask.fetchNotice,
            unavailableReason:
              typeof workingTask.fetchNotice === 'string'
                ? workingTask.fetchNotice
                : undefined,
          })
          const list = fetched.list
          if (!list.length) {
            throw new Error('弹幕为空')
          }
          if (fetched.notice) {
            mergerToast(fetched.notice, 'warn')
          }
          const injectIndex = success + fail + 1
          const result = await deps.injectDanmaku(
            list,
            {
              ...workingTask,
              id: resolvedSourceId,
              fetchMode: fetched.mode,
              fetchNotice: fetched.notice,
            },
            true,
            phase => {
              mergerProgressToast(
                `正在注入 ${injectIndex}/${items.length}：${title}（${list.length} 条）· ${phase}`,
              )
            },
          )

          const sourceGrew = deps.engine.getSources().length > sourcesBefore
          const sourceExists = hasSourceId(resolvedSourceId) || sourceGrew
          const mergedOk = result.ok || (result.screen || 0) > 0 || result.list || sourceExists
          if (mergedOk) {
            success++
            totalDm += result.count
          } else {
            fail++
            lastFailReason = result.reason || 'inject_failed'
          }
          mergerProgressToast(`进度 ${success + fail}/${items.length}：${resolvedTitle}`)
        } catch (err) {
          const sourceGrew = deps.engine.getSources().length > sourcesBefore
          const recovered =
            sourceGrew ||
            (resolvedSourceId ? hasSourceId(resolvedSourceId) : false) ||
            (task.bvid
              ? deps.engine
                  .getSources()
                  .some(
                    source =>
                      source.bvid === task.bvid &&
                      (task.cid == null || String(source.cid) === String(task.cid)),
                  )
              : false)
          if (recovered) {
            success++
          } else {
            fail++
            lastFailReason = err instanceof Error ? err.message : 'inject_failed'
          }
          mergerProgressToast(`进度 ${success + fail}/${items.length}：${resolvedTitle || '失败'}`)
        }
      }
    } finally {
      mergerProgressToastDone()
    }

    let finalMsg = `合并完成：${success}/${items.length} 个源`
    if (totalDm > 0) {
      finalMsg += `，共 ${totalDm} 条`
    }
    if (fail > 0) {
      finalMsg += `，${fail} 个失败`
      if (lastFailReason) {
        finalMsg += `（${reasonText[lastFailReason] || lastFailReason}）`
      }
    }
    if (success > 0 && !deps.hasListStore()) {
      finalMsg += '；右侧列表未同步（请先播放几秒再合并）'
    }
    if (fail > 0 && lastFailReason === 'player_not_ready') {
      finalMsg += '；请先播放几秒再合并'
    }

    mergerToast(finalMsg, success > 0 ? 'success' : 'error')
    if (success > 0) {
      // 合并成功后清空跨搜索已选，避免底部残留
      searchState.selectedBvids = []
      searchState.selectedVideos = {}
      searchState.expandedBvids = {}
      searchState.expandedPages = {}
      syncSearchVm()
    }
    refreshManagerGroups()
  }

  const openPreviewForSource = (sourceId: string) => {
    const source = deps.engine.sources?.get(String(sourceId))
    if (!source) {
      return
    }

    previewState.fullList = [...source.list]
    previewState.sortOrder = 1
    previewState.displayedCount = 0
    previewState.title = `弹幕预览 (共 ${previewState.fullList.length} 条)`
    previewState.items = previewState.fullList
      .slice(0, PREVIEW_PAGE_SIZE)
      .map(dm => ({ time: dm.time, text: dm.text }))
    previewState.displayedCount = previewState.items.length
    previewState.visible = true
    syncPreviewVm()
  }

  const host: MergerUiHost = {
    openSearchModal() {
      searchState.visible = true
      // 每次打开都按当前分 P / 当前视频标题刷新预填
      searchState.keyword = getInitialKeyword()
      syncSearchVm()
      // 仅打开瞬间写入输入框；之后用户改词不再被 host 覆盖
      if (searchVm) {
        Vue.set(searchVm.$data as Record<string, unknown>, 'searchInput', searchState.keyword)
      }
    },
    openManagerModal() {
      if (!managerVm) {
        dmWarn('管理弹窗尚未挂载，请稍后重试')
        return
      }
      searchState.visible = false
      previewState.visible = false
      syncSearchVm()
      syncPreviewVm()
      managerState.visible = true
      syncManagerVm()
      Vue.nextTick(() => {
        refreshManagerGroups()
        syncManagerVm()
      })
    },
    openPreviewModal(bvid: string) {
      const sources = deps.engine.getSources().filter(s => deps.resolveSourceBvid(s) === bvid)
      if (sources[0]) {
        openPreviewForSource(sources[0].id)
      }
    },
    getSourceSummaries(): MergerSourceSummary[] {
      return deps.engine.getSources().map(s => ({
        bvid: deps.resolveSourceBvid(s),
        title: s.title || '',
        count: s.count || 0,
        fetchMode: s.fetchMode,
        fetchNotice: s.fetchNotice,
      }))
    },
    getTotalMergedCount(): number {
      return deps.engine.getSources().reduce((acc, s) => acc + (s.count || 0), 0)
    },
  }

  handleBadgeOpen = () => host.openManagerModal()

  const wireSearchEvents = (vm: Vue) => {
    vm.$on(MERGER_MODAL_EVENTS.CLOSE, () => {
      searchState.visible = false
      syncSearchVm()
    })
    vm.$on(MERGER_MODAL_EVENTS.SEARCH, ({ keyword, page }: { keyword: string; page?: number }) => {
      // 记录用户实际搜索词，避免后续同步仍拿页面原标题
      searchState.keyword = keyword
      doSearch(keyword, page || 1, false)
    })
    vm.$on(
      MERGER_MODAL_EVENTS.LOAD_MORE,
      ({ keyword, page }: { keyword: string; page: number }) => {
        doSearch(keyword, page, true)
      },
    )
    vm.$on(MERGER_MODAL_EVENTS.SORT_CHANGE, ({ mode }: { mode: SearchUiState['sortMode'] }) => {
      searchState.sortMode = mode
      if (!searchVm) {
        return
      }
      const data = searchVm.$data as Record<string, unknown>
      Vue.set(data, 'sortMode', mode)
      if (searchState.results.length) {
        searchState.results = applySearchSort(searchState.results, mode)
        Vue.set(data, 'results', [...searchState.results])
      }
    })
    vm.$on(MERGER_MODAL_EVENTS.EXPAND_VIDEO, ({ bvid }: { bvid: string }) => {
      loadVideoPages(bvid)
    })
    vm.$on(MERGER_MODAL_EVENTS.COLLAPSE_VIDEO, ({ bvid }: { bvid: string }) => {
      searchState.expandedBvids[bvid] = false
      syncSearchVm()
    })
    vm.$on(
      MERGER_MODAL_EVENTS.SELECTION_CHANGE,
      ({
        selectedBvids,
        selectedVideos,
      }: {
        selectedBvids: string[]
        selectedVideos?: MergerSearchVideo[]
      }) => {
        searchState.selectedBvids = selectedBvids
        if (selectedVideos?.length) {
          rememberSelectedVideos(selectedVideos)
        }
        syncSelectedVideoCache(selectedBvids)
        syncSearchVm()
      },
    )
    vm.$on(MERGER_MODAL_EVENTS.BATCH_MERGE, ({ items }: { items: MergerBatchMergeItem[] }) => {
      runBatchMerge(items)
    })
    vm.$on(
      'update:pageSelection',
      ({ bvid, cid, selected }: { bvid: string; cid: number; selected: boolean }) => {
        const pages = searchState.expandedPages[bvid]
        if (!pages) {
          return
        }
        const page = pages.find(p => p.cid === cid)
        if (!page) {
          return
        }
        page.selected = selected

        // 分P勾选驱动父级已选：有勾选则加入，全无则移除
        const anySelected = pages.some(item => item.selected)
        if (anySelected && !searchState.selectedBvids.includes(bvid)) {
          searchState.selectedBvids = [...searchState.selectedBvids, bvid]
          const video = searchState.results.find(item => item.bvid === bvid)
          if (video) {
            rememberSelectedVideos([video])
          }
        } else if (!anySelected) {
          searchState.selectedBvids = searchState.selectedBvids.filter(id => id !== bvid)
        }
        syncSelectedVideoCache(searchState.selectedBvids)

        if (searchState.partModeEnabled[bvid]) {
          applyPartModeOffsets(bvid, true)
        } else {
          syncExpandedPagesToVm(bvid)
        }
        // 回写 selectedBvids / selectedVideos，保证父勾选与底部已选即时更新
        syncSearchVm()
      },
    )
    vm.$on(
      'update:offset',
      ({
        bvid,
        cid,
        offset,
        offsetType,
      }: {
        bvid: string
        cid: number
        offset: number
        offsetType: MergerOffsetType
      }) => {
        const pages = searchState.expandedPages[bvid]
        if (!pages) {
          return
        }
        const page = pages.find(p => p.cid === cid)
        if (!page) {
          return
        }
        page.offset = offset
        page.offsetType = offsetType
        syncExpandedPagesToVm(bvid)
      },
    )
    vm.$on('update:partModeEnabled', ({ bvid, enabled }: { bvid: string; enabled: boolean }) => {
      searchState.partModeEnabled[bvid] = enabled
      if (enabled) {
        applyPartModeOffsets(bvid, true)
      } else {
        syncSearchVm()
      }
    })
    vm.$on('calc-offsets', ({ bvid }: { bvid: string }) => {
      if (!searchState.partModeEnabled[bvid]) {
        mergerToast('请先开启分P有效顺延', 'warn')
        return
      }
      applyPartModeOffsets(bvid, false)
    })
    vm.$on('select-all-pages', ({ bvid, select }: { bvid: string; select: boolean }) => {
      const pages = searchState.expandedPages[bvid]
      if (!pages) {
        return
      }
      pages.forEach(page => {
        page.selected = select
      })
      if (select && !searchState.selectedBvids.includes(bvid)) {
        searchState.selectedBvids = [...searchState.selectedBvids, bvid]
        const video = searchState.results.find(item => item.bvid === bvid)
        if (video) {
          rememberSelectedVideos([video])
        }
      }
      if (!select) {
        searchState.selectedBvids = searchState.selectedBvids.filter(id => id !== bvid)
      }
      syncSelectedVideoCache(searchState.selectedBvids)
      if (searchState.partModeEnabled[bvid]) {
        applyPartModeOffsets(bvid, true)
      } else {
        syncExpandedPagesToVm(bvid)
      }
      syncSearchVm()
    })
    vm.$on(
      'part-duration-change',
      (payload: {
        bvid: string
        field: 'total' | 'uniform' | 'part'
        cid?: number
        value: string
      }) => {
        const fields =
          searchState.partModeFields[payload.bvid] ||
          defaultPartModeFields(payload.bvid, deps.loadPartModeState)
        searchState.partModeFields[payload.bvid] = fields

        if (payload.field === 'total') {
          fields.total = payload.value
        } else if (payload.field === 'uniform') {
          fields.uniform = payload.value
        } else if (payload.field === 'part' && payload.cid != null) {
          fields.partDurations[payload.cid] = payload.value
          fields.userEditedParts.add(payload.cid)
          const pages = searchState.expandedPages[payload.bvid]
          const page = pages?.find(p => p.cid === payload.cid)
          if (page) {
            page.partDurationText = payload.value
          }
        }

        deps.savePartModeState(payload.bvid, { total: fields.total, uniform: fields.uniform })
        if (searchState.partModeEnabled[payload.bvid]) {
          applyPartModeOffsets(payload.bvid, true)
        } else if (payload.field === 'part' && payload.cid != null) {
          syncExpandedPagesToVm(payload.bvid)
        } else {
          syncSearchVm()
        }
      },
    )
  }

  const wireManagerEvents = (vm: Vue) => {
    vm.$on(MANAGER_MODAL_EVENTS.CLOSE, () => {
      managerState.visible = false
      syncManagerVm()
    })
    vm.$on(MANAGER_MODAL_EVENTS.SELECTION_CHANGE, ({ selectedIds }: { selectedIds: string[] }) => {
      managerState.selectedIds = selectedIds
      syncManagerVm()
    })
    vm.$on(MANAGER_MODAL_EVENTS.SELECT_ALL, async ({ select }: { select: boolean }) => {
      if (select) {
        managerState.selectedIds = managerState.groups.flatMap(g => g.items.map(i => i.id))
      } else {
        managerState.selectedIds = []
      }
      syncManagerVm()
    })
    vm.$on(MANAGER_MODAL_EVENTS.BATCH_DELETE, async ({ ids }: { ids: string[] }) => {
      if (!ids.length) {
        return
      }
      const confirmed = await mergerConfirm(
        '批量删除',
        `确定要移除选中的 ${ids.length} 个弹幕源吗？此操作不可撤销。`,
      )
      if (!confirmed) {
        return
      }
      ids.forEach(id => deps.engine.removeSource(id))
      mergerToast(`已删除 ${ids.length} 个弹幕源`, 'success')
      refreshManagerGroups()
    })
    vm.$on(MANAGER_MODAL_EVENTS.CLEAR_ALL, async () => {
      const confirmed = await mergerConfirm(
        '清除全部',
        '确定要移除当前视频所有已合并的弹幕吗？此操作不可撤销。',
      )
      if (!confirmed) {
        return
      }
      deps.engine.getSources().forEach(s => deps.engine.removeSource(s.id))
      mergerToast('已清除所有合并的弹幕', 'success')
      refreshManagerGroups()
    })
    vm.$on(MANAGER_MODAL_EVENTS.ADD_MORE, () => {
      managerState.visible = false
      syncManagerVm()
      host.openSearchModal()
    })
    vm.$on(
      MANAGER_MODAL_EVENTS.TOGGLE_GROUP,
      ({ groupKey, expanded }: { groupKey: string; expanded: boolean }) => {
        if (expanded) {
          if (!managerState.expandedGroups.includes(groupKey)) {
            managerState.expandedGroups = [...managerState.expandedGroups, groupKey]
          }
        } else {
          managerState.expandedGroups = managerState.expandedGroups.filter(k => k !== groupKey)
        }
        syncManagerVm()
      },
    )
    vm.$on(
      MANAGER_MODAL_EVENTS.UPDATE_OFFSET,
      ({ sourceId, offset }: { sourceId: string; offset: number }) => {
        deps.engine.updateSource(sourceId, { offset })
        refreshManagerGroups()
      },
    )
    vm.$on(MANAGER_MODAL_EVENTS.REMOVE_SOURCE, async ({ sourceId }: { sourceId: string }) => {
      const confirmed = await mergerConfirm('移除弹幕源', '确认移除此弹幕源？不再合并其弹幕。')
      if (!confirmed) {
        return
      }
      deps.engine.removeSource(sourceId)
      refreshManagerGroups()
    })
    vm.$on(MANAGER_MODAL_EVENTS.PREVIEW_SOURCE, ({ sourceId }: { sourceId: string }) => {
      openPreviewForSource(sourceId)
    })
  }

  const wirePreviewEvents = (vm: Vue) => {
    vm.$on(PREVIEW_MODAL_EVENTS.CLOSE, () => {
      previewState.visible = false
      syncPreviewVm()
    })
    vm.$on(PREVIEW_MODAL_EVENTS.SORT_TOGGLE, ({ order }: { order: 1 | -1 }) => {
      previewState.sortOrder = order
      const sorted = [...previewState.fullList].sort((a, b) => (a.time - b.time) * order)
      previewState.fullList = sorted
      previewState.displayedCount = 0
      previewState.items = sorted.slice(0, PREVIEW_PAGE_SIZE).map(dm => ({
        time: dm.time,
        text: dm.text,
      }))
      previewState.displayedCount = previewState.items.length
      syncPreviewVm()
    })
    vm.$on(PREVIEW_MODAL_EVENTS.LOAD_MORE, () => {
      const next = previewState.fullList.slice(
        previewState.displayedCount,
        previewState.displayedCount + PREVIEW_PAGE_SIZE,
      )
      if (!next.length) {
        return
      }
      previewState.items = [
        ...previewState.items,
        ...next.map(dm => ({ time: dm.time, text: dm.text })),
      ]
      previewState.displayedCount = previewState.items.length
      syncPreviewVm()
    })
  }

  const removeStaleModalNodes = () => {
    document.querySelectorAll('.dm-merger-modal-mask').forEach(node => node.remove())
  }

  const mount = async () => {
    destroyMergerConfirm()
    removeStaleModalNodes()

    const [MergerModal, ManagerModal, PreviewModal, MergerCountBadge] = await Promise.all([
      import('./MergerModal.vue'),
      import('./ManagerModal.vue'),
      import('./PreviewModal.vue'),
      import('./MergerCountBadge.vue'),
    ])

    searchVm = mountVueComponent(MergerModal) as Vue & SearchUiState
    Object.assign(searchVm.$data, { ...searchState, searchInput: searchState.keyword })
    document.body.appendChild(searchVm.$el)
    wireSearchEvents(searchVm)

    managerVm = mountVueComponent(ManagerModal) as Vue & ManagerUiState
    Object.assign(managerVm.$data, { ...managerState })
    document.body.appendChild(managerVm.$el)
    wireManagerEvents(managerVm)

    previewVm = mountVueComponent(PreviewModal) as Vue & PreviewUiState
    Object.assign(previewVm.$data, {
      ...previewState,
      hasMore: false,
    })
    document.body.appendChild(previewVm.$el)
    wirePreviewEvents(previewVm)

    badgeVm = mountVueComponent(MergerCountBadge)
    Object.assign(badgeVm.$data, {
      totalCount: 0,
      sourceCount: 0,
      visible: false,
    })
    refreshBadge()

    document.addEventListener('dm-sources-updated', refreshBadge)
  }

  const destroy = () => {
    document.removeEventListener('dm-sources-updated', refreshBadge)
    searchVm?.$destroy()
    managerVm?.$destroy()
    previewVm?.$destroy()
    badgeVm?.$destroy()
    destroyMergerConfirm()
    searchVm = null
    managerVm = null
    previewVm = null
    badgeVm = null
  }

  const handleVideoChange = () => {
    searchState.visible = false
    managerState.visible = false
    previewState.visible = false
    // 换视频或分 P 后，清空旧预填，下次打开再读新标题
    searchState.keyword = ''
    syncSearchVm()
    syncManagerVm()
    syncPreviewVm()
    refreshBadge()
  }

  const handlePartChange = () => {
    // 弹窗打开时用户可能正在改搜索词，不覆盖输入框
    if (searchState.visible) {
      return
    }
    // 分 P 标题可能稍后才写入 DOM，短延迟后只更新下次打开用的预填
    const applyKeyword = () => {
      if (searchState.visible) {
        return
      }
      searchState.keyword = getInitialKeyword()
    }
    applyKeyword()
    window.setTimeout(applyKeyword, 300)
    window.setTimeout(applyKeyword, 1000)
  }

  return {
    host,
    mount,
    handleVideoChange,
    handlePartChange,
    destroy,
    refreshBadge,
  }
}

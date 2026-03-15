import { dqa } from './utils'
import { select } from './spin-query'
import { matchCurrentPage, playerUrls } from './utils/urls'

type ObserverTarget = string | Element[] | Element
type MutationObserverTarget = string | Node[] | Node
export const resolveTargets = <
  T extends ObserverTarget | MutationObserverTarget,
  ResultType = T extends ObserverTarget ? Element[] : Node[],
>(
  target: T,
): ResultType => {
  if (typeof target === 'string') {
    return dqa(target) as ResultType
  }
  if (Array.isArray(target)) {
    return target as ResultType
  }
  return [target] as ResultType
}

export const mutationObserve = (
  targets: Node[],
  config: MutationObserverInit,
  callback: MutationCallback,
) => {
  const observer = new MutationObserver(callback)
  targets.forEach(it => observer.observe(it, config))
  callback([], observer)
  return [observer, config] as const
}
/** 监听直接子元素
 * @param target 监听目标
 * @param callback 回调函数
 */
export const childList = (target: MutationObserverTarget, callback: MutationCallback) =>
  mutationObserve(
    resolveTargets(target),
    {
      childList: true,
      subtree: false,
      attributes: false,
    },
    callback,
  )
/** 监听所有子孙元素
 * @param target 监听目标
 * @param callback 回调函数
 */
export const childListSubtree = (target: MutationObserverTarget, callback: MutationCallback) =>
  mutationObserve(
    resolveTargets(target),
    {
      childList: true,
      subtree: true,
      attributes: false,
    },
    callback,
  )
/** 监听自身的HTML属性变化
 * @param target 监听目标
 * @param callback 回调函数
 */
export const attributes = (target: MutationObserverTarget, callback: MutationCallback) =>
  mutationObserve(
    resolveTargets(target),
    {
      childList: false,
      subtree: false,
      attributes: true,
    },
    callback,
  )
/** 监听自身及其子孙元素的HTML属性变化
 * @param target 监听目标
 * @param callback 回调函数
 */
export const attributesSubtree = (target: MutationObserverTarget, callback: MutationCallback) =>
  mutationObserve(
    resolveTargets(target),
    {
      childList: false,
      subtree: true,
      attributes: true,
    },
    callback,
  )
/** 监听自身的文本内容变化
 * @param target 监听目标
 * @param callback 回调函数
 */
export const characterData = (target: MutationObserverTarget, callback: MutationCallback) =>
  mutationObserve(
    resolveTargets(target),
    {
      childList: false,
      subtree: false,
      attributes: false,
      characterData: true,
    },
    callback,
  )
/** 监听自身及其子孙元素的文本内容变化
 * @param target 监听目标
 * @param callback 回调函数
 */
export const characterDataSubtree = (target: MutationObserverTarget, callback: MutationCallback) =>
  mutationObserve(
    resolveTargets(target),
    {
      childList: false,
      subtree: true,
      attributes: false,
      characterData: true,
    },
    callback,
  )
/** 监听指定目标上的所有变化, 包括自身及子孙元素的元素增减, 属性变化, 文本内容变化
 *
 * 若需要监听 `document.body` 上的, 请使用 allMutations
 * @param target 监听目标
 * @param callback 回调函数
 */
export const allMutationsOn = (target: MutationObserverTarget, callback: MutationCallback) =>
  mutationObserve(
    resolveTargets(target),
    {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    },
    callback,
  )

const everyNodesObserver: {
  observer: MutationObserver
  config: MutationObserverInit
  callbacks: MutationCallback[]
} = {
  observer: null,
  config: null,
  callbacks: [],
}
/**
 * 监听 `document.body` 上的所有变化, 包括自身及子孙元素的元素增减, 属性变化, 文本内容变化
 * @param callback 回调函数
 */
export const allMutations = (callback: MutationCallback) => {
  if (!everyNodesObserver.observer) {
    everyNodesObserver.callbacks.push(callback)
    const [observer, config] = allMutationsOn(document.body, records =>
      everyNodesObserver.callbacks.forEach(c => c(records, everyNodesObserver.observer)),
    )
    everyNodesObserver.observer = observer
    everyNodesObserver.config = config
  } else {
    everyNodesObserver.callbacks.push(callback)
  }
  return everyNodesObserver
}

export const intersectionObserve = (
  targets: Element[],
  config: IntersectionObserverInit,
  callback: IntersectionObserverCallback,
) => {
  const observer = new IntersectionObserver(callback, config)
  targets.forEach(it => observer.observe(it))
  return [observer, config] as const
}
/**
 * 监听元素进入视图内/变为可见
 * @param target 监听目标
 * @param callback 回调函数
 */
export const visible = (target: ObserverTarget, callback: IntersectionObserverCallback) =>
  intersectionObserve(resolveTargets(target), {}, callback)
/**
 * 监听元素进入指定容器内/变为可见
 * @param target 监听目标
 * @param container 容器
 * @param margin 检测边距
 * @param callback 回调函数
 */
export const visibleInside = (
  target: ObserverTarget,
  container: HTMLElement,
  margin: string,
  callback: IntersectionObserverCallback,
) =>
  intersectionObserve(
    resolveTargets(target),
    {
      root: container,
      rootMargin: margin,
    },
    callback,
  )

export const resizeObserve = (
  targets: Element[],
  config: ResizeObserverOptions,
  callback: ResizeObserverCallback,
) => {
  const observer = new ResizeObserver(callback)
  targets.forEach(it => observer.observe(it, config))
  return [observer, config] as const
}
/**
 * 监听元素自身的尺寸变化
 * @param target 监听目标
 * @param callback 回调函数
 */
export const sizeChange = (target: ObserverTarget, callback: ResizeObserverCallback) =>
  resizeObserve(
    resolveTargets(target),
    {
      box: 'border-box',
    },
    callback,
  )

const setupUrlChangeListener = lodash.once(() => {
  let lastUrl = document.URL
  const fireEvent = () => {
    const event = new CustomEvent('urlChange', { detail: document.URL })
    window.dispatchEvent(event)
  }
  allMutations(() => {
    if (lastUrl !== document.URL) {
      fireEvent()
      lastUrl = document.URL
    }
  })
})
/**
 * 监听 URL 变化
 * @param callback 回调函数
 * @param config 事件监听选项
 */
export const urlChange = (callback: (url: string) => void, config?: AddEventListenerOptions) => {
  setupUrlChangeListener()
  callback(document.URL)
  window.addEventListener('urlChange', () => callback(document.URL), config)
}

/** 等待 cid */
const selectCid = lodash.once(() =>
  select(() => {
    if (unsafeWindow.cid) {
      return unsafeWindow.cid
    }
    return null
  }),
)

let cidHooked = false
export type VideoChangeCallback = (id: { aid: string; cid: string }) => void
/**
 * 监听视频的变化, 等待视频加载并开始监听后 resolve
 * @param callback 回调函数
 * @param config 事件监听选项
 * @returns 是否有视频存在
 */
export const videoChange = async (
  callback: VideoChangeCallback,
  config?: AddEventListenerOptions,
) => {
  if (!matchCurrentPage(playerUrls)) {
    return false
  }
  const cid = await selectCid()
  if (cid === null) {
    return false
  }
  const getId = () => ({
    aid: unsafeWindow.aid,
    cid: unsafeWindow.cid,
  })
  const fireEvent = () => {
    const detail = getId()
    const event = new CustomEvent('videoChange', { detail })
    window.dispatchEvent(event)
  }
  if (!cidHooked) {
    let lastCid = cid
    allMutations(() => {
      const { cid: newCid } = getId()
      // b 站代码的神秘行为, 在更换 cid 时会临时改成一个数组, 做监听要忽略这种值
      if (Array.isArray(newCid)) {
        return
      }
      if (lastCid !== newCid && !lodash.isNil(newCid)) {
        fireEvent()
        lastCid = newCid
      }
    })
    cidHooked = true
  }
  callback(getId())
  window.addEventListener(
    'videoChange',
    (e: CustomEvent<ReturnType<typeof getId>>) => callback(e.detail),
    config,
  )
  return true
}

const INITIAL_STATE_KEY = '__INITIAL_STATE__'
const VIDEO_DATA_CHANGE_EVENT_NAME = 'videoDataChange'
const VIDEO_DATA_CHANGE_STABILIZE_DELAY = 200 // 经验值，过低会导致多次 videoDataChange 触发，过高会导致 videoDataChange 触发时间延迟增加
const VIDEO_DATA_CHANGE_STABILIZE_TIMEOUT = 3000 // 超时时间，如果 __INITIAL_STATE__.cid 更新后，超过此超时时间，脏数据仍未更新，则丢掉此次变更

let videoDataHooked = false
let videoDataObserverVm: (Vue & { state: (typeof unsafeWindow)[typeof INITIAL_STATE_KEY] }) | null =
  null
let videoDataEmitTimer: ReturnType<typeof setTimeout> | undefined
let videoDataEmitStartedAt: number | undefined
let lastVideoDataEmitted: VideoDataChangeDetail | undefined

/** 等待 __INITIAL_STATE__ */
const selectInitialState = lodash.once(() =>
  select(() => {
    if (unsafeWindow[INITIAL_STATE_KEY]) {
      return unsafeWindow[INITIAL_STATE_KEY]
    }
    return null
  }),
)

export interface VideoDataChangePage {
  cid?: number
  part?: string
  title?: string
}
export interface VideoDataChangeEpisode {
  bvid?: string
  title?: string
  pages?: VideoDataChangePage[]
}
export interface VideoDataChangeSection {
  id?: number
  title?: string
  season_id?: number // 和 seasonsInfo.id 保持一致
  episodes?: VideoDataChangeEpisode[]
}
export interface VideoDataChangeDetail {
  bvid?: string
  aid?: number
  cid?: number
  videoData?: {
    title?: string
    pages?: VideoDataChangePage[]
  }
  sectionsInfo?: {
    id?: number
    title?: string
    sections?: VideoDataChangeSection[]
  }
}
export interface VideoChangeDetail {
  aid: string
  cid: string
}
export interface VideoDataChangeDetailPayload {
  type: 'VideoDataChangeDetail'
  isFirst: boolean
  detail: VideoDataChangeDetail
}
export interface VideoChangePayload {
  type: 'VideoChange'
  isFirst: boolean
  detail: VideoChangeDetail
}
export type VideoDataPayload = VideoDataChangeDetailPayload | VideoChangePayload
export const isVideoChangeDetail = (payload: VideoDataPayload): payload is VideoChangePayload =>
  payload.type === 'VideoChange'
export const isVideoDataChangeDetail = (
  payload: VideoDataPayload,
): payload is VideoDataChangeDetailPayload => payload.type === 'VideoDataChangeDetail'
export type VideoDataChangeCallback = (videoData: VideoDataPayload) => void

const isSameVideoDataDetail = (
  detail?: VideoDataChangeDetail,
  previousDetail?: VideoDataChangeDetail,
) => lodash.isEqual(detail, previousDetail)
const getVideoDataIdentityKey = (detail?: VideoDataChangeDetail) =>
  [detail?.aid ?? '', detail?.bvid ?? '', detail?.cid ?? ''].join('|')

const isCurrentVideoInSections = (detail: VideoDataChangeDetail) => {
  const sections = detail.sectionsInfo?.sections ?? []
  if (sections.length === 0) {
    return true
  }
  return sections.some(section =>
    (section.episodes ?? []).some(
      episode =>
        episode.bvid === detail.bvid || (episode.pages ?? []).some(page => page.cid === detail.cid),
    ),
  )
}

const isVideoDataDirty = (
  detail: VideoDataChangeDetail | undefined,
  previousDetail?: VideoDataChangeDetail,
) => {
  if (!detail) {
    return false
  }
  if (detail.cid !== undefined && typeof detail.cid !== 'number') {
    return true
  }
  const { sectionsInfo } = detail
  if (!sectionsInfo) {
    return false
  }
  const sections = sectionsInfo.sections ?? []
  if (
    sectionsInfo.id !== undefined &&
    sections.some(
      section => section.season_id !== undefined && section.season_id !== sectionsInfo.id,
    )
  ) {
    return true
  }
  const hasVideoChanged =
    getVideoDataIdentityKey(detail) !== getVideoDataIdentityKey(previousDetail)
  const hasSectionEpisodes = sections.some(section => (section.episodes?.length ?? 0) > 0)
  if (hasVideoChanged && sections.length > 0 && sectionsInfo.id === undefined) {
    return true
  }
  console.log('isCurrentVideoInSections(detail)', isCurrentVideoInSections(detail))
  if (hasSectionEpisodes && !isCurrentVideoInSections(detail)) {
    return true
  }

  return false
}

/**
 * 监听 window.\_\_INITIAL_STATE\_\_.cid 的变化，作用等价于 videoChange，对于想要等待 window.\_\_INITIAL_STATE\_\_ 更新状态的场景来说针对性更强
 *
 * 注意有一些限制：
 * - B站部分页面没有注入 window.\_\_INITIAL_STATE\_\_，这种情况下，videoDataChange 会回退到 videoChange 的行为
 *
 * @param callback
 * @param config
 * @returns
 */
export const videoDataChange = async (
  callback: VideoDataChangeCallback,
  config?: AddEventListenerOptions,
) => {
  if (!matchCurrentPage(playerUrls)) {
    return false
  }

  const initialState = await selectInitialState()
  // 如果获取不到 __INITIAL_STATE__，则退化为 videoChange 行为
  if (initialState == null) {
    let isFirst = true
    return videoChange(detail => {
      callback({
        type: 'VideoChange',
        isFirst,
        detail,
      })
      isFirst = false
    }, config)
  }

  const getVideoData = (): VideoDataChangeDetail | undefined => {
    const state = unsafeWindow[INITIAL_STATE_KEY]
    if (!state) {
      return undefined
    }
    return {
      bvid: state.bvid,
      aid: state.aid,
      cid: state.cid,
      videoData: state.videoData,
      sectionsInfo: state.sectionsInfo,
    }
  }

  const createPayload = (
    detail: VideoDataChangeDetail,
    isFirst = false,
  ): VideoDataChangeDetailPayload => ({
    type: 'VideoDataChangeDetail',
    isFirst,
    detail,
  })

  const fireEvent = (payload: VideoDataChangeDetailPayload) => {
    const event = new CustomEvent(VIDEO_DATA_CHANGE_EVENT_NAME, { detail: payload })
    window.dispatchEvent(event)
  }

  const queueVideoDataEmit = (resetStartedAt = false) => {
    const detail = getVideoData()
    if (!detail || isSameVideoDataDetail(detail, lastVideoDataEmitted)) {
      videoDataEmitStartedAt = undefined
      if (videoDataEmitTimer !== undefined) {
        clearTimeout(videoDataEmitTimer)
        videoDataEmitTimer = undefined
      }
      return
    }
    if (resetStartedAt || videoDataEmitStartedAt === undefined) {
      videoDataEmitStartedAt = Date.now()
    }
    if (videoDataEmitTimer !== undefined) {
      clearTimeout(videoDataEmitTimer)
      videoDataEmitTimer = undefined
    }
    videoDataEmitTimer = setTimeout(() => {
      const latestDetail = getVideoData()
      if (!latestDetail || isSameVideoDataDetail(latestDetail, lastVideoDataEmitted)) {
        videoDataEmitStartedAt = undefined
        return
      }
      const waitedTooLong =
        videoDataEmitStartedAt !== undefined &&
        Date.now() - videoDataEmitStartedAt >= VIDEO_DATA_CHANGE_STABILIZE_TIMEOUT
      if (waitedTooLong) {
        // fireEvent(latestDetail)
        return
      }
      if (isVideoDataDirty(latestDetail, lastVideoDataEmitted)) {
        queueVideoDataEmit(false)
        return
      }
      lastVideoDataEmitted = lodash.cloneDeep(latestDetail)
      videoDataEmitStartedAt = undefined
      fireEvent(createPayload(latestDetail))
    }, VIDEO_DATA_CHANGE_STABILIZE_DELAY)
  }

  if (!videoDataHooked) {
    videoDataObserverVm = new Vue({
      data: {
        state: initialState,
      },
      watch: {
        'state.cid': function stateCidWatcher(newVal, oldVal) {
          if (newVal === oldVal) {
            return
          }
          queueVideoDataEmit(true)
        },
        state: {
          handler() {
            queueVideoDataEmit(false)
          },
          deep: true,
        },
      },
    }) as typeof videoDataObserverVm
    videoDataHooked = true
  }

  const currentVideoData = getVideoData()
  if (lastVideoDataEmitted === undefined && currentVideoData) {
    lastVideoDataEmitted = lodash.cloneDeep(currentVideoData)
    callback(createPayload(currentVideoData, true))
  }

  window.addEventListener(
    VIDEO_DATA_CHANGE_EVENT_NAME,
    (e: CustomEvent<VideoDataChangeDetailPayload>) => callback(e.detail),
    config,
  )

  return true
}

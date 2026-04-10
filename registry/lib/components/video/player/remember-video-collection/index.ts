import { defineComponentMetadata } from '@/components/define'
import { VideoInfo } from '@/components/video/video-info'
import { videoChange } from '@/core/observer'
import { addComponentListener, removeComponentListener } from '@/core/settings'
import { Toast } from '@/core/toast'
import { useScopedConsole } from '@/core/utils/log'
import { playerUrls } from '@/core/utils/urls'
import { buildCurrentMemory, filterHistory, getHistoryScope, upsertHistory } from './history'
import {
  clearMarkings,
  getMarkedInstructions,
  renderMarkings,
  setMarkingStyle,
  startMarkingObserver,
} from './marking'
import { handleFirstLoadPrompt } from './prompt'
import {
  clearRememberVideoCollectionPendingJumpTargets,
  resetRememberVideoCollectionRuntime,
  setRememberVideoCollectionPendingJumpTargets,
  updateRememberVideoCollectionRuntime,
} from './runtime'
import { resolveJumpTargets } from './navigation'
import {
  MarkingStyle,
  SectionMode,
  type ComponentMemory,
  type ComponentOptions,
  type HistoryScope,
  type MarkingInstruction,
} from './types'

const logger = useScopedConsole('rememberVideoCollection')
const componentName = 'rememberVideoCollection'
const componentDisplayName = '记忆合集进度'

let currentInstructions: MarkingInstruction[] = []
let currentSettings: { options: ComponentOptions } | null = null
let stopMarkingObserver = lodash.noop
let videoDataAbortController: AbortController | null = null
let runId = 0
let currentDetail: VideoInfo | null = null
let currentHistoryScope: HistoryScope | null = null
let currentMemory: ComponentMemory | null = null

const rerenderMarkings = () => {
  if (!currentSettings) {
    return
  }
  setMarkingStyle(currentSettings.options.markingStyle)
  renderMarkings(currentInstructions)
}

const syncRuntimeState = () => {
  updateRememberVideoCollectionRuntime({
    currentInstructions,
    currentDetail: currentDetail ?? undefined,
    currentMemory,
    historyScope: currentHistoryScope,
    sectionMode: currentSettings?.options.sectionMode ?? SectionMode.Split,
  })
}

const updateInstructionsForCurrentScope = () => {
  if (!currentSettings || !currentHistoryScope) {
    currentInstructions = []
    rerenderMarkings()
    syncRuntimeState()
    return
  }
  const scopedHistory = filterHistory(currentSettings.options.history, currentHistoryScope)
  logger.info('scopedHistory', scopedHistory)
  currentInstructions = getMarkedInstructions(scopedHistory, currentSettings.options.sectionMode)
  logger.info('currentInstructions', currentInstructions)
  rerenderMarkings()
  syncRuntimeState()
}

const restartMarkingObserver = () => {
  stopMarkingObserver()
  stopMarkingObserver = startMarkingObserver(() => {
    rerenderMarkings()
  })
}

const markingStyleListener = (style: MarkingStyle) => setMarkingStyle(style)
const historyListener = () => updateInstructionsForCurrentScope()
const sectionModeListener = () => updateInstructionsForCurrentScope()

const unloadRememberVideoCollection = () => {
  runId++
  videoDataAbortController?.abort()
  videoDataAbortController = null
  removeComponentListener(`${componentName}.markingStyle`, markingStyleListener)
  removeComponentListener(`${componentName}.history`, historyListener)
  removeComponentListener(`${componentName}.sectionMode`, sectionModeListener)
  stopMarkingObserver()
  stopMarkingObserver = lodash.noop
  currentInstructions = []
  currentDetail = null
  currentHistoryScope = null
  currentMemory = null
  clearMarkings()
  resetRememberVideoCollectionRuntime()
}

const activateRememberVideoCollection = async (title: string) => {
  unloadRememberVideoCollection()
  if (!currentSettings) {
    return
  }
  addComponentListener(`${componentName}.markingStyle`, markingStyleListener, true)
  addComponentListener(`${componentName}.history`, historyListener)
  addComponentListener(`${componentName}.sectionMode`, sectionModeListener)
  const activeRunId = ++runId
  const abortController = new AbortController()
  videoDataAbortController = abortController
  let latestFetchId = 0
  let isFirst = true
  await videoChange(
    async detail => {
      if (abortController.signal.aborted || activeRunId !== runId) {
        return
      }
      const fetchId = ++latestFetchId
      const info = new VideoInfo(detail.aid)

      let videoDetail: VideoInfo
      try {
        videoDetail = await info.fetchInfo()
        videoDetail.cid = Number(detail.cid)
      } catch (error) {
        if (!abortController.signal.aborted && activeRunId === runId && fetchId === latestFetchId) {
          logger.warn('failed to fetch video info', error)
        }
        return
      }

      if (abortController.signal.aborted || activeRunId !== runId || fetchId !== latestFetchId) {
        return
      }

      const isFirstLoad = isFirst
      isFirst = false

      currentDetail = videoDetail
      logger.info('video detail', videoDetail)
      currentHistoryScope = getHistoryScope(videoDetail)
      logger.info('historyScope', currentHistoryScope)
      if (!currentHistoryScope) {
        currentInstructions = []
        currentMemory = null
        clearRememberVideoCollectionPendingJumpTargets()
        rerenderMarkings()
        stopMarkingObserver()
        syncRuntimeState()
        return
      }

      let currentHistory = currentSettings.options.history
      updateInstructionsForCurrentScope()
      restartMarkingObserver()
      currentMemory = buildCurrentMemory(videoDetail)
      logger.info('currentMemory', currentMemory)
      if (!currentMemory) {
        if (isFirstLoad) {
          clearRememberVideoCollectionPendingJumpTargets()
        }
        syncRuntimeState()
        return
      }
      if (isFirstLoad) {
        const pendingJumpTargets = resolveJumpTargets({
          currentInstructions,
          currentMemory,
          currentDetail: videoDetail,
          sectionMode: currentSettings.options.sectionMode,
        })
        setRememberVideoCollectionPendingJumpTargets(
          pendingJumpTargets.canJumpLast ? pendingJumpTargets : undefined,
        )
      }
      syncRuntimeState()

      if (isFirstLoad) {
        const promptResult = await handleFirstLoadPrompt({
          currentInstructions,
          currentMemory,
          currentDetail: videoDetail,
          enabled: currentSettings.options.showPrompt,
          signal: abortController.signal,
          title,
          sectionMode: currentSettings.options.sectionMode,
        })
        if (abortController.signal.aborted || activeRunId !== runId) {
          return
        }
        logger.info('first load prompt result', promptResult)
        if (promptResult.action === 'jump' || promptResult.action === 'jump-next') {
          if (!promptResult.jumpSucceeded) {
            logger.warn(
              'failed to jump to last played instruction',
              promptResult.lastPlayedInstruction,
            )
            Toast.error('跳转失败', componentDisplayName)
          } else {
            clearRememberVideoCollectionPendingJumpTargets()
          }
          return
        }
      }

      currentHistory = upsertHistory(currentHistory, currentMemory)
      currentSettings.options.history = currentHistory
      logger.info('currentHistory', currentHistory)
      updateInstructionsForCurrentScope()
    },
    { signal: abortController.signal },
  )
}

export const component = defineComponentMetadata<ComponentOptions>({
  name: componentName,
  displayName: componentDisplayName,
  description: {
    'zh-CN':
      '记忆合集与多P视频的播放进度, 在列表中标记已观看/上次播放位置, 并提供跳转提示与记忆管理功能面板.',
  },
  author: {
    name: 'JLoeve (with Kilo Code & Codex)',
    link: 'https://github.com/LonelySteve',
  },
  tags: [componentsTags.video],
  urlInclude: playerUrls,
  instantStyles: [
    {
      name: 'rememberVideoCollection',
      style: () => import('./remember-video-collection.scss'),
    },
  ],
  widget: {
    component: () => import('./Widget.vue').then(m => m.default),
  },
  options: {
    history: {
      defaultValue: [],
      hidden: true,
    },
    markingStyle: {
      defaultValue: MarkingStyle.Distinguish,
      displayName: '标记样式',
      dropdownEnum: MarkingStyle,
    },
    sectionMode: {
      defaultValue: SectionMode.Split,
      displayName: '多TAB合集模式',
      dropdownEnum: SectionMode,
    },
    showPrompt: {
      defaultValue: true,
      displayName: '提示是否跳转到上次播放',
    },
  },
  entry: async ({ metadata, settings }) => {
    currentSettings = settings
    await activateRememberVideoCollection(metadata.displayName)
  },
  reload: () => activateRememberVideoCollection(componentDisplayName),
  unload: unloadRememberVideoCollection,
})

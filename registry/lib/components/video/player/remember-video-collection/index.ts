import { defineComponentMetadata } from '@/components/define'
import { VideoInfo } from '@/components/video/video-info'
import { videoChange } from '@/core/observer'
import {
  addComponentListener,
  getComponentSettings,
  removeComponentListener,
} from '@/core/settings'
import { Toast } from '@/core/toast'
import { useScopedConsole } from '@/core/utils/log'
import { playerUrls } from '@/core/utils/urls'
import type { KeyBindingAction } from '../../../utils/keymap/bindings'
import {
  buildCurrentMemory,
  filterHistory,
  getHistoryScope,
  getHistoryVisitKey,
  upsertHistory,
} from './history'
import { clearMarkings, getMarkedInstructions, syncMarkings, startMarkingObserver } from './marking'
import { handleFirstLoadPrompt } from './prompt'
import {
  clearRememberVideoCollectionPendingApply,
  clearRememberVideoCollectionRbvpMode,
  getRememberVideoCollectionRbvpVideoKey,
  isRememberVideoCollectionUsingRbvp,
  setRememberVideoCollectionPendingApply,
  shouldRememberVideoCollectionApply,
} from './rbvp'
import {
  clearRememberVideoCollectionPendingJumpTargets,
  clearCurrentRememberedVideoHistory,
  getRememberVideoCollectionRuntimeState,
  jumpToRememberedNextVideo,
  jumpToRememberedVideo,
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
const componentDisplayName = '记忆合集'

let currentInstructions: MarkingInstruction[] = []
let currentSettings: { options: ComponentOptions } | null = null
let stopMarkingObserver = lodash.noop
let videoDataAbortController: AbortController | null = null
let runId = 0
let currentDetail: VideoInfo | null = null
let currentHistoryScope: HistoryScope | null = null
let currentMemory: ComponentMemory | null = null

const rerenderMarkings = (overrides?: { markingStyle?: MarkingStyle }) => {
  if (!currentSettings) {
    return
  }
  syncMarkings(currentInstructions, overrides?.markingStyle ?? currentSettings.options.markingStyle)
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

const getRememberVideoCollectionUnavailableMessage = () => {
  const settings = getComponentSettings<ComponentOptions>(componentName)
  if (!settings.enabled) {
    return '组件已禁用，不能使用合集记忆快捷键'
  }
  const state = getRememberVideoCollectionRuntimeState()
  if (!state.available) {
    return '当前页面没有可用的合集记忆'
  }
  return undefined
}

const createRememberVideoCollectionKeyAction = (
  displayName: string,
  action: () => boolean | Promise<boolean>,
  getFailureMessage: () => string,
): KeyBindingAction => ({
  displayName,
  run: async () => {
    const unavailableMessage = getRememberVideoCollectionUnavailableMessage()
    if (unavailableMessage) {
      Toast.error(unavailableMessage, componentDisplayName, 5e3)
      return true
    }
    if (await action()) {
      return true
    }
    Toast.info(getFailureMessage(), componentDisplayName, 3e3)
    return true
  },
})

const updateInstructionsForCurrentScope = (options?: {
  forceApply?: boolean
  videoKey?: string
}) => {
  if (!currentSettings || !currentHistoryScope) {
    currentInstructions = []
    rerenderMarkings()
    syncRuntimeState()
    return
  }
  const shouldApplyHistory =
    options?.forceApply ||
    shouldRememberVideoCollectionApply(
      options?.videoKey ??
        getRememberVideoCollectionRbvpVideoKey(currentDetail?.aid, currentDetail?.cid),
    )
  const scopedHistory = shouldApplyHistory
    ? filterHistory(currentSettings.options.history, currentHistoryScope)
    : []
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

const markingStyleListener = (style: MarkingStyle) => rerenderMarkings({ markingStyle: style })
const historyListener = () => updateInstructionsForCurrentScope()
const sectionModeListener = () => updateInstructionsForCurrentScope()
const useRbvpListener = () => {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  activateRememberVideoCollection(componentDisplayName)
}

const unloadRememberVideoCollection = () => {
  runId++
  videoDataAbortController?.abort()
  videoDataAbortController = null
  removeComponentListener(`${componentName}.markingStyle`, markingStyleListener)
  removeComponentListener(`${componentName}.history`, historyListener)
  removeComponentListener(`${componentName}.sectionMode`, sectionModeListener)
  removeComponentListener(`${componentName}.useRbvp`, useRbvpListener)
  stopMarkingObserver()
  stopMarkingObserver = lodash.noop
  currentInstructions = []
  currentDetail = null
  currentHistoryScope = null
  currentMemory = null
  clearRememberVideoCollectionPendingApply()
  clearRememberVideoCollectionRbvpMode()
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
  addComponentListener(`${componentName}.useRbvp`, useRbvpListener)
  const activeRunId = ++runId
  const abortController = new AbortController()
  videoDataAbortController = abortController
  let latestFetchId = 0
  let isFirst = true
  let lastVisitKey: string | undefined
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

      const rbvpVideoKey = getRememberVideoCollectionRbvpVideoKey(videoDetail.aid, videoDetail.cid)
      currentDetail = videoDetail
      logger.info('video detail', videoDetail)
      currentHistoryScope = getHistoryScope(videoDetail)
      logger.info('historyScope', currentHistoryScope)
      if (!currentHistoryScope) {
        isFirst = false
        lastVisitKey = undefined
        currentInstructions = []
        currentMemory = null
        clearRememberVideoCollectionPendingApply(rbvpVideoKey)
        clearRememberVideoCollectionPendingJumpTargets()
        rerenderMarkings()
        stopMarkingObserver()
        syncRuntimeState()
        return
      }

      let currentHistory = currentSettings.options.history
      updateInstructionsForCurrentScope({ videoKey: rbvpVideoKey })
      restartMarkingObserver()
      currentMemory = buildCurrentMemory(videoDetail)
      logger.info('currentMemory', currentMemory)
      const visitKey = getHistoryVisitKey(
        currentHistoryScope,
        currentSettings.options.sectionMode,
        currentMemory,
      )
      logger.info('visitKey', visitKey)
      const isFirstLoad = isFirst || visitKey !== lastVisitKey
      logger.info('isFirstLoad', isFirstLoad)
      isFirst = false
      lastVisitKey = visitKey
      if (!currentMemory) {
        if (isFirstLoad) {
          clearRememberVideoCollectionPendingApply(rbvpVideoKey)
          clearRememberVideoCollectionPendingJumpTargets()
        }
        syncRuntimeState()
        return
      }
      let applied = false
      const applyCurrentMemory = async () => {
        if (applied || abortController.signal.aborted || activeRunId !== runId) {
          return
        }
        applied = true
        updateInstructionsForCurrentScope({ videoKey: rbvpVideoKey })
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
            clearRememberVideoCollectionPendingApply(rbvpVideoKey)
            return
          }
        }

        currentHistory = upsertHistory(currentHistory, currentMemory)
        currentSettings.options.history = currentHistory
        logger.info('currentHistory', currentHistory)
        updateInstructionsForCurrentScope()
        clearRememberVideoCollectionPendingApply(rbvpVideoKey)
      }

      if (isRememberVideoCollectionUsingRbvp()) {
        setRememberVideoCollectionPendingApply(applyCurrentMemory, rbvpVideoKey)
        if (shouldRememberVideoCollectionApply(rbvpVideoKey)) {
          await applyCurrentMemory()
          return
        }
        if (isFirstLoad) {
          clearRememberVideoCollectionPendingJumpTargets()
        }
        syncRuntimeState()
        return
      }

      clearRememberVideoCollectionPendingApply(rbvpVideoKey)
      await applyCurrentMemory()
    },
    { signal: abortController.signal },
  )
}

export const component = defineComponentMetadata<ComponentOptions>({
  name: componentName,
  displayName: componentDisplayName,
  description: {
    'zh-CN': `

> 记忆合集与多P视频的播放进度，在列表中标记已观看/上次播放位置，并提供跳转提示与记忆管理功能面板.

#### 🔧 **选项**

- \`标记样式\`：控制视频列表中已观看和上次播放视频的视觉标记方式。「不区分」使用相同的标记样式，「区分」则对「上次播放」和「已观看」使用不同的标记样式.
- \`多TAB合集模式\`：对于包含多个 TAB 分区的合集，「分别记忆」为每个 TAB 单独记录播放进度，「统一记忆」则将整个合集视为一个整体进行记忆.
- \`提示是否跳转到上次播放\`：打开此选项后，每次进入合集页面时若检测到上次播放位置与当前不一致，将弹出提示框询问是否跳转到上次播放位置，同时可一键跳转到下一个视频.
- \`交由 RBVP 决定恢复策略\`：打开此选项后，「记忆合集」不再自行决定是否恢复和记录合集进度，而是作为 RBVP 的兼容存储层使用.
  - 此选项仅在安装并启用 RBVP 组件后可见.

#### ⌨️ **快捷键**

组件安装后会自动注册以下快捷键（可在「插件 - 快捷键扩展」中自定义）：

- \`Shift + H\`：跳转到上次播放
- \`Shift + N\`：跳转到下一个视频
- \`Shift + Delete\`：清除当前视频的合集记忆

#### 📋 **侧栏面板**

点击播放器侧栏的「合集记忆」按钮可打开面板，包含两个页签：

- **上次播放**：查看上次播放和下一个视频信息，并提供一键跳转按钮.
- **记忆管理**：查看当前作用域及全部记忆的视频数量，支持清除当前作用域或全部合集记忆.

#### 🔗 **RBVP 联动**

在 RBVP 规则中可通过命名空间 \`rememberVideoCollection\` 调用本组件（别名可在 RBVP 设置 - 命名空间页自定义，写入主规则文本），支持以下动作值：

- \`ON\`：按原逻辑恢复并记录合集进度
- \`OFF\`：跳过恢复且不记录当前合集记忆进度

使用前需先开启选项「交由 RBVP 决定恢复策略」.

#### 🌈 **温馨提示**

「记忆合集」的记忆数据均存储在本地，不会上传到服务器.

如需管理或清除特定视频的记忆，可在播放页面使用快捷键或侧栏面板操作.
`,
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
  plugin: {
    displayName: '合集记忆 - 快捷键支持',
    setup: async ({ addData }) => {
      const { rememberVideoCollectionNamespaceProvider } = await import('./rbvp-provider')
      addData('keymap.actions', (actions: Record<string, KeyBindingAction>) => {
        actions.rememberVideoCollectionJumpLast = createRememberVideoCollectionKeyAction(
          '合集记忆：跳转到上次播放',
          () => {
            const state = getRememberVideoCollectionRuntimeState()
            if (!state.canJumpLast) {
              return false
            }
            return jumpToRememberedVideo()
          },
          () => {
            const state = getRememberVideoCollectionRuntimeState()
            return state.lastPlayedLabel ? '当前已经位于上次播放位置' : '当前作用域暂无上次播放记录'
          },
        )
        actions.rememberVideoCollectionJumpNext = createRememberVideoCollectionKeyAction(
          '合集记忆：跳转到下一个',
          () => {
            const state = getRememberVideoCollectionRuntimeState()
            if (!state.canJumpNext) {
              return false
            }
            return jumpToRememberedNextVideo()
          },
          () => '没有可跳转的下一个视频',
        )
        actions.rememberVideoCollectionClearCurrent = createRememberVideoCollectionKeyAction(
          '合集记忆：清除当前视频记忆',
          clearCurrentRememberedVideoHistory,
          () => '当前视频暂无可清除的合集记忆',
        )
      })
      addData('keymap.presets', (presetBase: Record<string, string>) => {
        presetBase.rememberVideoCollectionJumpLast = 'shift h'
        presetBase.rememberVideoCollectionJumpNext = 'shift n'
        presetBase.rememberVideoCollectionClearCurrent = 'shift delete'
      })
      addData('rbvp.namespaces', namespaces => {
        delete namespaces.collection
        namespaces.rememberVideoCollection = rememberVideoCollectionNamespaceProvider
      })
    },
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
    useRbvp: {
      defaultValue: false,
      displayName: '交由 RBVP 决定恢复策略',
      hidden: true,
    },
  },
  extraOptions: () => import('./settings/ExtraOptions.vue').then(m => m.default),
  entry: async ({ metadata, settings }) => {
    currentSettings = settings
    await activateRememberVideoCollection(metadata.displayName)
  },
  reload: () => activateRememberVideoCollection(componentDisplayName),
  unload: unloadRememberVideoCollection,
})

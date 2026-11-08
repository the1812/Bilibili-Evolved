import { playerAgent } from '@/components/video/player-agent'
import { videoChange } from '@/core/observer'
import { addComponentListener, ComponentSettings, metadataToOptions } from '@/core/settings'
import { isEmbeddedPlayer, playerReady } from '@/core/utils'
import { formatDuration } from '@/core/utils/formatters'
import { sq } from '@/core/spin-query'
import { isInOfficialEnding, tryGetOfficialEnding } from './ending'
import { waitForHistoryResume } from './history'
import { Options, options, ToastDefaultAction, ToastPosition } from './options'
import { ManagedPlayerToast, showManagedPlayerToast, ToastMode } from './toast-ui'

export interface RestartSessionState {
  /** 当前分 P/集是否启用自动近结尾重头 */
  autoEnabled: boolean
  /** 触发重头前记录的原进度 */
  originalTime: number | null
  /** 最近一次触发模式 */
  mode: ToastMode | null
  aid: string | null
  cid: string | null
}

let enabled = false
let videoChangeBound = false
let bindingVideoChange = false
let activeToast: ManagedPlayerToast | null = null
let sessionToken = 0
let controlButtonMounted = false
let bindRetryCount = 0
const MaxBindRetry = 10
const defaultOptions: Options = metadataToOptions(options)
let latestOptions: Options = { ...defaultOptions }

const session: RestartSessionState = {
  autoEnabled: true,
  originalTime: null,
  mode: null,
  aid: null,
  cid: null,
}

const log = (...args: unknown[]) => {
  console.info('[restartNearEnd]', ...args)
}

const normalizeOptions = (raw?: Partial<Options> | Record<string, unknown>): Options => {
  const thresholdPercent = Number(raw?.thresholdPercent)
  const minDuration = Number(raw?.minDuration)
  const historyWaitTimeout = Number(raw?.historyWaitTimeout)
  const toastDurationSeconds = Number(raw?.toastDurationSeconds)
  const toastPosition = raw?.toastPosition
  const defaultAction = raw?.defaultAction
  return {
    thresholdPercent:
      Number.isFinite(thresholdPercent) && thresholdPercent > 0
        ? thresholdPercent
        : defaultOptions.thresholdPercent,
    enableOfficialEnding: raw?.enableOfficialEnding !== false,
    enableControlButton: raw?.enableControlButton !== false,
    minDuration:
      Number.isFinite(minDuration) && minDuration >= 0 ? minDuration : defaultOptions.minDuration,
    historyWaitTimeout:
      Number.isFinite(historyWaitTimeout) && historyWaitTimeout > 0
        ? historyWaitTimeout
        : defaultOptions.historyWaitTimeout,
    toastDurationSeconds:
      Number.isFinite(toastDurationSeconds) && toastDurationSeconds >= 1
        ? toastDurationSeconds
        : defaultOptions.toastDurationSeconds,
    toastPosition: Object.values(ToastPosition).includes(toastPosition as ToastPosition)
      ? (toastPosition as ToastPosition)
      : defaultOptions.toastPosition,
    defaultAction: Object.values(ToastDefaultAction).includes(defaultAction as ToastDefaultAction)
      ? (defaultAction as ToastDefaultAction)
      : defaultOptions.defaultAction,
  }
}

const disposeToast = () => {
  activeToast?.dispose()
  activeToast = null
}

const resetSessionProgress = () => {
  session.originalTime = null
  session.mode = null
  session.autoEnabled = true
}

export const getRestartSession = () => session

export const getRestartOptions = () => latestOptions

/** 组件是否处于启用运行状态（供附带插件判断快捷键是否生效） */
export const isComponentEnabled = () => enabled

const waitForDuration = async (video: HTMLVideoElement) => {
  if (Number.isFinite(video.duration) && video.duration > 0) {
    return video.duration
  }
  await new Promise<void>(resolve => {
    if (video.readyState >= 1 && Number.isFinite(video.duration) && video.duration > 0) {
      resolve()
      return
    }
    video.addEventListener('loadedmetadata', () => resolve(), { once: true })
  })
  const duration = await sq(
    () => video.duration,
    value => Number.isFinite(value) && value > 0,
    { maxRetry: 20, queryInterval: 100 },
  )
  return duration && Number.isFinite(duration) ? duration : null
}

export const seekAndPlay = async (time: number) => {
  const seekResult = playerAgent.seek(time)
  if (seekResult === null) {
    const videoElement = (await playerAgent.query.video.element()) as HTMLVideoElement | null
    if (videoElement) {
      videoElement.currentTime = time
    }
  }
  const video = (await playerAgent.query.video.element()) as HTMLVideoElement | null
  if (!video) {
    return
  }
  try {
    await video.play()
  } catch (e) {
    log('play() rejected, trying muted autoplay', e)
    const wasMuted = video.muted
    video.muted = true
    try {
      await video.play()
      if (!wasMuted) {
        video.muted = false
      }
    } catch (e2) {
      log('muted autoplay also rejected', e2)
    }
  }
}

const goNextEpisode = async () => {
  const nextButton = playerAgent.query.control.buttons.next.sync()
  if (nextButton) {
    nextButton.click()
    return
  }
  const fallback = dq(
    '.bpx-player-control-bottom .bpx-player-ctrl-next, .bilibili-player-video-btn-next',
  ) as HTMLElement | null
  if (fallback) {
    fallback.click()
    return
  }
  // 没有「下一集」按钮时把进度拉到最后, 由播放器自身的播完逻辑衔接下一集/选集面板
  const video = (await playerAgent.query.video.element()) as HTMLVideoElement | null
  if (!video) {
    return
  }
  const { duration } = video
  if (!Number.isFinite(duration) || duration <= 0) {
    return
  }
  video.currentTime = duration
  try {
    await video.play()
  } catch (e) {
    log('seek-to-end play() rejected', e)
  }
}

/** 还原到触发前进度; 无记录时返回 false */
export const restoreOriginalProgress = async () => {
  if (session.originalTime === null) {
    log('restore skipped: no saved progress')
    return false
  }
  await seekAndPlay(session.originalTime)
  log('restored', session.originalTime)
  return true
}

/** 切换当前分 P 自动重头 */
export const toggleSessionAutoEnabled = () => {
  session.autoEnabled = !session.autoEnabled
  log('autoEnabled=', session.autoEnabled)
  return session.autoEnabled
}

/**
 * 控制栏 / 快捷键主操作:
 * - 有保存进度: 还原
 * - 否则: 切换自动重头开关
 */
export const runPrimaryControlAction = async () => {
  if (session.originalTime !== null) {
    return restoreOriginalProgress()
  }
  const enabledNow = toggleSessionAutoEnabled()
  const { Toast } = await import('@/core/toast')
  Toast.info(
    enabledNow ? '已开启：近结尾将自动从头播放' : '已关闭：本集不再自动从头播放',
    '近结尾自动重头',
    2500,
  )
  return enabledNow
}

/** 手动选择模式下从头播放: 以点击时刻的进度作为可还原点 */
const restartFromBeginning = async () => {
  const video = (await playerAgent.query.video.element()) as HTMLVideoElement | null
  const playerTime = playerAgent.nativeApi?.getCurrentTime?.() ?? video?.currentTime ?? 0
  session.originalTime = Math.max(Number(playerTime) || 0, 0)
  await seekAndPlay(0)
  log('manual restart', session.originalTime)
}

const applyRestart = async (mode: ToastMode, originalTime: number) => {
  session.mode = mode
  const manualRestart = latestOptions.defaultAction === ToastDefaultAction.Manual
  if (!manualRestart) {
    session.originalTime = originalTime
    await seekAndPlay(0)
  }
  activeToast = showManagedPlayerToast({
    mode,
    originalTime,
    restarted: !manualRestart,
    durationMs: latestOptions.toastDurationSeconds * 1000,
    position: latestOptions.toastPosition,
    onRestart: () => {
      restartFromBeginning().then(none)
    },
    onRestore: () => {
      restoreOriginalProgress().then(none)
    },
    onNext: () => {
      goNextEpisode().then(none)
    },
  })
  log(
    'applied restart',
    mode,
    manualRestart ? 'manual' : 'auto',
    formatDuration(Math.floor(originalTime)),
  )
}

const handleVideo = async (token: number) => {
  disposeToast()
  resetSessionProgress()
  if (!enabled || isEmbeddedPlayer()) {
    return
  }

  const currentOptions = latestOptions
  session.aid = String(unsafeWindow.aid ?? '')
  session.cid = String(unsafeWindow.cid ?? '')
  log('start handle', {
    thresholdPercent: currentOptions.thresholdPercent,
    enableOfficialEnding: currentOptions.enableOfficialEnding,
    url: document.URL,
  })

  await playerReady()
  if (!enabled || token !== sessionToken) {
    return
  }

  const video = (await playerAgent.query.video.element()) as HTMLVideoElement | null
  if (!video || !enabled || token !== sessionToken) {
    return
  }

  const duration = await waitForDuration(video)
  if (!duration || !enabled || token !== sessionToken) {
    log('skip: invalid duration', duration)
    return
  }
  if (duration < currentOptions.minDuration) {
    log('skip: duration too short', duration)
    return
  }

  // 先拿到时长, 再做历史检测, 避免把开播前几秒误判成历史
  const history = await waitForHistoryResume({
    timeoutMs: currentOptions.historyWaitTimeout,
    duration,
    thresholdPercent: currentOptions.thresholdPercent,
  })
  if (!enabled || token !== sessionToken) {
    return
  }
  if (!history) {
    log('skip: no history resume')
    return
  }
  if (!session.autoEnabled) {
    log('skip: session auto disabled')
    return
  }

  const playerTime = playerAgent.nativeApi?.getCurrentTime?.() ?? video.currentTime
  const originalTime = Math.max(history.time, Number(playerTime) || 0)
  const progressRatio = originalTime / duration
  log('resume position', {
    source: history.source,
    originalTime,
    duration,
    progressRatio,
  })

  // 官方片尾必须真实有效: start 应靠近片尾
  let mode: ToastMode | null = null
  if (currentOptions.enableOfficialEnding) {
    const ending = await tryGetOfficialEnding()
    if (!enabled || token !== sessionToken) {
      return
    }
    const validEnding =
      ending &&
      ending.start > 0 &&
      ending.start >= duration * 0.5 &&
      isInOfficialEnding(originalTime, ending)
    if (validEnding) {
      mode = 'ending'
      log('mode=ending', ending)
    } else {
      log('official ending not matched', ending)
    }
  }

  if (!mode) {
    if (progressRatio >= currentOptions.thresholdPercent / 100) {
      mode = 'progress'
      log('mode=progress')
    } else {
      log('skip: below threshold', {
        progressPercent: Math.round(progressRatio * 1000) / 10,
        thresholdPercent: currentOptions.thresholdPercent,
      })
    }
  }

  if (!mode || !enabled || token !== sessionToken) {
    return
  }

  await applyRestart(mode, originalTime)
}

const runForCurrentVideo = () => {
  sessionToken += 1
  const token = sessionToken
  handleVideo(token).then(none)
}

const bindVideoChange = async () => {
  if (videoChangeBound || bindingVideoChange || !enabled) {
    return
  }
  bindingVideoChange = true
  try {
    const ok = await videoChange(() => {
      if (!enabled) {
        return
      }
      runForCurrentVideo()
    })
    if (ok) {
      videoChangeBound = true
      bindRetryCount = 0
      log('videoChange bound')
      return
    }
    if (bindRetryCount >= MaxBindRetry || !enabled) {
      log('videoChange bind giving up', { bindRetryCount })
      bindingVideoChange = false
      return
    }
    bindRetryCount += 1
    log('videoChange not ready, retry later', { bindRetryCount })
    window.setTimeout(() => {
      bindingVideoChange = false
      bindVideoChange().then(none)
    }, 1000)
  } catch (error) {
    log('videoChange bind failed', error)
    if (bindRetryCount >= MaxBindRetry || !enabled) {
      log('videoChange bind giving up after error', { bindRetryCount })
      bindingVideoChange = false
      return
    }
    bindRetryCount += 1
    window.setTimeout(() => {
      bindingVideoChange = false
      bindVideoChange().then(none)
    }, 1000)
  } finally {
    if (videoChangeBound) {
      bindingVideoChange = false
    }
  }
}

const controlBarButtonName = 'restartNearEndControl'

const mountControlButton = async () => {
  if (controlButtonMounted || !enabled || !latestOptions.enableControlButton) {
    return
  }
  controlButtonMounted = true
  try {
    const { addControlBarButton, removeControlBarButton } = await import(
      '@/components/video/video-control-bar'
    )
    if (!enabled || !latestOptions.enableControlButton) {
      controlButtonMounted = false
      return
    }
    await addControlBarButton({
      name: controlBarButtonName,
      displayName: '近结尾重头',
      icon: 'mdi-replay',
      order: 4,
      action: () => {
        runPrimaryControlAction().then(none)
      },
    })
    if (!enabled || !latestOptions.enableControlButton) {
      await removeControlBarButton(controlBarButtonName)
      controlButtonMounted = false
      return
    }
    log('control button mounted')
  } catch (error) {
    controlButtonMounted = false
    log('control button unavailable', error)
  }
}

const unmountControlButton = async () => {
  if (!controlButtonMounted) {
    return
  }
  controlButtonMounted = false
  try {
    const { removeControlBarButton } = await import('@/components/video/video-control-bar')
    await removeControlBarButton(controlBarButtonName)
    log('control button removed')
  } catch (error) {
    log('control button remove failed', error)
  }
}

const bindOptionListeners = lodash.once(() => {
  addComponentListener('restartNearEnd.thresholdPercent', (value: number) => {
    latestOptions = normalizeOptions({ ...latestOptions, thresholdPercent: value })
    log('option thresholdPercent=', latestOptions.thresholdPercent)
  })
  addComponentListener('restartNearEnd.enableOfficialEnding', (value: boolean) => {
    latestOptions = normalizeOptions({ ...latestOptions, enableOfficialEnding: value })
  })
  addComponentListener('restartNearEnd.enableControlButton', (value: boolean) => {
    latestOptions = normalizeOptions({ ...latestOptions, enableControlButton: value })
    if (value) {
      mountControlButton().then(none)
    } else {
      unmountControlButton().then(none)
    }
  })
  addComponentListener('restartNearEnd.defaultAction', (value: ToastDefaultAction) => {
    latestOptions = normalizeOptions({ ...latestOptions, defaultAction: value })
  })
  addComponentListener('restartNearEnd.toastDurationSeconds', (value: number) => {
    latestOptions = normalizeOptions({ ...latestOptions, toastDurationSeconds: value })
  })
  addComponentListener('restartNearEnd.toastPosition', (value: ToastPosition) => {
    latestOptions = normalizeOptions({ ...latestOptions, toastPosition: value })
  })
})

export const startRestartNearEnd = async (settings?: ComponentSettings<Options>) => {
  enabled = true
  if (settings?.options) {
    latestOptions = normalizeOptions(settings.options)
  } else {
    latestOptions = normalizeOptions(latestOptions)
  }
  bindOptionListeners()
  log('started', latestOptions)
  mountControlButton().then(none)
  runForCurrentVideo()
  await bindVideoChange()
}

export const stopRestartNearEnd = async () => {
  enabled = false
  sessionToken += 1
  videoChangeBound = false
  bindingVideoChange = false
  bindRetryCount = 0
  disposeToast()
  resetSessionProgress()
  await unmountControlButton()
  log('stopped')
}

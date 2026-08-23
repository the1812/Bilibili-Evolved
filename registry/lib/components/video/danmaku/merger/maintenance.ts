import { showDialog } from '@/core/dialog'
import { getComponentSettings } from '@/core/settings'
import { dmLog } from './danmaku/log'
import { formatPlayerNotReadyHint } from './runtime/helpers'
import { mergerConfirm, mergerToast } from './ui/notify'

const COMPONENT_NAME = 'danmakuMerger'

/** runtime 注入的维护依赖（init 时注册，cleanup 时清空） */
export interface MergerMaintenanceDeps {
  diagAsync: (timeoutMs: number) => Promise<unknown>
  waitForPlayer: (timeoutMs: number, onProgress?: (phase: string) => void) => Promise<boolean>
  getPlayerReadiness: () => {
    hasBpx: boolean
    hasVideo: boolean
    hasPlayer: boolean
  }
  ensureCapture: (force?: boolean) => void
  hasListStore: () => boolean
  burstCaptureStore: () => Promise<void>
  fullSyncAsync: (sources: Map<string, unknown>) => Promise<{
    screen: number
    list: boolean
  }>
  getStores: () => { dmListStore?: { allDm?: unknown[] } } | null
  getEngineSources: () => Map<string, unknown> | undefined
  listMergerStoreKeys: () => string[]
  deleteStorageKey: (key: string) => void
}

let maintenanceDeps: MergerMaintenanceDeps | null = null

export const registerMergerMaintenance = (deps: MergerMaintenanceDeps | null): void => {
  maintenanceDeps = deps
}

const requireDeps = (): MergerMaintenanceDeps => {
  if (!maintenanceDeps) {
    throw new Error('弹幕合并器尚未在当前页面初始化，请打开视频页并确认组件已启用')
  }
  return maintenanceDeps
}

/** 是否显示设置面板「选项」区的维护按钮 */
export const isMergerMaintenanceEnabled = (): boolean => {
  try {
    return getComponentSettings(COMPONENT_NAME).options.showMaintenanceActions !== false
  } catch {
    return true
  }
}

/** 弹幕列表诊断 */
export const mergerRunDiag = async (): Promise<void> => {
  const deps = requireDeps()
  const diag = await deps.diagAsync(8000)
  dmLog('维护诊断', diag)
  const body = diag ? JSON.stringify(diag, null, 2) : '诊断失败'
  showDialog({
    title: '弹幕列表诊断',
    content: body,
    zIndex: 100010,
  })
}

/** 手动重同步右侧弹幕列表 */
export const mergerRunResync = async (): Promise<void> => {
  const deps = requireDeps()

  if (!(await deps.waitForPlayer(20000, undefined))) {
    const hint = formatPlayerNotReadyHint(deps.getPlayerReadiness(), 'resync')
    mergerToast(`播放器未就绪：${hint}`, 'error', '重新同步列表')
    return
  }

  deps.ensureCapture(true)
  if (!deps.hasListStore()) {
    await deps.burstCaptureStore()
  }

  const sources = deps.getEngineSources()
  if (!sources?.size) {
    mergerToast('当前页无已合并源，请先合并弹幕', 'warn', '重新同步列表')
    return
  }

  const result = await deps.fullSyncAsync(sources)
  dmLog('手动列表重同步', result)

  const listLen = deps.getStores()?.dmListStore?.allDm?.length ?? '无'
  mergerToast(
    `同步完成：画面 ${result.screen} 条，列表 ${
      result.list ? '已写入' : '未写入'
    }（allDm: ${listLen}）`,
    result.list || result.screen > 0 ? 'success' : 'warn',
    '重新同步列表',
  )
}

/** 清除所有已保存的合并记忆 */
export const mergerRunClearStorage = async (): Promise<void> => {
  const deps = requireDeps()
  const dmKeys = deps.listMergerStoreKeys().filter(k => k.startsWith('dm_merger_store_'))

  if (dmKeys.length === 0) {
    mergerToast('没有已保存的合并记录', 'info', '清除合并记忆')
    return
  }

  const confirmed = await mergerConfirm(
    '清除合并记忆',
    `确定要清除所有 ${dmKeys.length} 个视频的合并记录吗？此操作不可撤销。`,
  )
  if (!confirmed) {
    return
  }

  dmKeys.forEach(key => deps.deleteStorageKey(key))
  mergerToast(`已清除 ${dmKeys.length} 条合并记忆，页面即将刷新`, 'success', '清除合并记忆')
  location.reload()
}

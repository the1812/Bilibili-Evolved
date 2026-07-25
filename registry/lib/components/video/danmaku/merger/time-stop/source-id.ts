import { DM_MERGER_PREFIX } from '../danmaku/inject'

/** 从 dmid 解析合并源 ID；非合并弹幕返回 null */
export const parseSourceIdFromDmid = (dmid: string | null | undefined): string | null => {
  const raw = String(dmid || '')
  if (!raw.startsWith(DM_MERGER_PREFIX)) {
    return null
  }
  const rest = raw.slice(DM_MERGER_PREFIX.length)
  // 格式：{srcId}_{rawDmid}；srcId 可能含 BV 与下划线，取最后一个 _ 之前
  const idx = rest.lastIndexOf('_')
  if (idx <= 0) {
    return rest || null
  }
  return rest.slice(0, idx) || null
}

/** 从 tip 上下文或弹幕节点 dataset 尽量取 dmid */
export const readDmidFromContext = (node: Element | null): string | null => {
  if (!node) {
    return null
  }
  const withData =
    (node.closest('[data-dmid],[data-id-str],[data-id]') as HTMLElement | null) ||
    (node as HTMLElement)
  const dmid =
    withData.dataset?.dmid ||
    withData.dataset?.idStr ||
    withData.getAttribute('data-dmid') ||
    withData.getAttribute('data-id-str') ||
    withData.getAttribute('data-id')
  return dmid ? String(dmid) : null
}

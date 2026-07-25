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

/**
 * 读取弹幕节点可见文案。
 * bpx 画面层节点通常只有 textContent，没有 dmid 属性。
 */
export const readDanmakuTextFromElement = (node: Element | null): string => {
  if (!node) {
    return ''
  }
  return String((node as HTMLElement).innerText || node.textContent || '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** 规范化弹幕文案：去空白，并去掉列表前缀【xxx】 */
export const normalizeDanmakuText = (text: string | null | undefined): string => {
  const raw = String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!raw) {
    return ''
  }
  // 右侧列表 / allDm 合并项常见「【BVxxx】正文」；画面层通常只有正文
  return raw.replace(/^【[^】]+】/, '').trim() || raw
}

/** 两条弹幕文案是否等价（允许一侧带列表前缀） */
export const isSameDanmakuText = (
  a: string | null | undefined,
  b: string | null | undefined,
): boolean => {
  const left = String(a || '')
    .replace(/\s+/g, ' ')
    .trim()
  const right = String(b || '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!left || !right) {
    return false
  }
  if (left === right) {
    return true
  }
  return normalizeDanmakuText(left) === normalizeDanmakuText(right)
}

/**
 * 在合并源列表中按文案反查 sourceId。
 * 优先唯一精确匹配；多源命中同一文案时返回 null，避免误绑。
 */
export const resolveSourceIdByText = (
  text: string,
  sources: Iterable<{ id: string; texts: Iterable<string> }>,
): string | null => {
  const needle = String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!needle) {
    return null
  }
  const needleNorm = normalizeDanmakuText(needle)
  const hits: string[] = []
  for (const source of sources) {
    for (const raw of source.texts) {
      const item = String(raw || '')
        .replace(/\s+/g, ' ')
        .trim()
      if (!item) {
        continue
      }
      if (item === needle || normalizeDanmakuText(item) === needleNorm) {
        hits.push(String(source.id))
        break
      }
    }
  }
  if (hits.length === 1) {
    return hits[0]
  }
  return null
}

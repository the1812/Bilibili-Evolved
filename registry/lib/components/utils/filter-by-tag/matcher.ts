/**
 * 标签匹配规则.
 *
 * - 默认是「包含」匹配: 屏蔽项 `原神` 会命中标签 `原神·枫丹`.
 * - 也可以把屏蔽项写成 `/正则/` 的形式来精确控制, 与动态过滤器的写法保持一致.
 * - 大小写和首尾空格都不敏感.
 */

export interface MatchResult {
  matched: boolean
  /** 命中的那条屏蔽规则, 用于在提示/日志里说明原因 */
  pattern: string
  /** 实际命中的标签名 */
  tag: string
}

export const normalizeText = (text: string) => text.trim().toLowerCase()

const isRegexPattern = (pattern: string) => {
  if (pattern.length <= 2 || !pattern.startsWith('/') || !pattern.endsWith('/')) {
    return false
  }
  try {
    // 仅用于校验正则是否合法, 不保留结果
    RegExp(pattern.slice(1, -1))
    return true
  } catch {
    return false
  }
}

/** 把标签整理成用于比对的形式 (小写, 去首尾空白) */
export const normalizeTag = (tag: string) => normalizeText(tag)

export const matchTag = (tags: string[], patterns: string[]): MatchResult => {
  const validPatterns = patterns
    .map(pattern => pattern.trim())
    .filter(pattern => pattern.length > 0)
  if (validPatterns.length === 0 || tags.length === 0) {
    return { matched: false, pattern: '', tag: '' }
  }
  const normalizedTags = tags.map(tag => ({ raw: tag, normalized: normalizeTag(tag) }))
  for (const pattern of validPatterns) {
    if (isRegexPattern(pattern)) {
      try {
        const regex = new RegExp(pattern.slice(1, -1), 'i')
        const hit = normalizedTags.find(tag => regex.test(tag.raw))
        if (hit) {
          return { matched: true, pattern, tag: hit.raw }
        }
      } catch {
        // 正则本身写错时跳过这一条, 不影响其他规则
      }
      continue
    }
    const needle = normalizeTag(pattern)
    const hit = normalizedTags.find(tag => tag.normalized.includes(needle))
    if (hit) {
      return { matched: true, pattern, tag: hit.raw }
    }
  }
  return { matched: false, pattern: '', tag: '' }
}

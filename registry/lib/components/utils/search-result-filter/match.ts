/** 搜索接口 (search/all/v2, search/type) 返回的视频条目中用到的字段 */
export interface SearchVideoInfo {
  bvid: string
  /** 带 `<em class="keyword">` 高亮的标题 */
  title: string
  /** 逗号分隔的标签 */
  tag: string
  /** 关键词命中的字段 (title / tag / description ...), 为空表示该视频不是由关键词召回的 */
  hit_columns: string[] | null
}

/**
 * B 站搜索结果由关键词召回和非关键词召回 (语义相关 / 热门 / 账号个性化推荐) 混排而成,
 * 后者的 `hit_columns` 为空, 无关视频基本都来自这一路
 */
export const isPushed = (info: SearchVideoInfo) => (info.hit_columns ?? []).length === 0

const keywordHighlightPattern = /<em class="keyword">(.*?)<\/em>/g

const decodeHtml = (html: string) => {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = html.replace(/<[^>]+>/g, '')
  return textarea.value
}

const normalize = (text: string) => decodeHtml(text).toLowerCase()

/**
 * 一个关键词对应的匹配条件: 命中 `whole`, 或命中任意一个 `parts`
 *
 * 不带空格的长关键词 (例如 `hanser演唱会全程录像`) 会被 B 站分词后再匹配,
 * 这里借用 B 站在标题中高亮的片段还原分词结果, 避免整串匹配导致误杀.
 */
export interface MatchTerm {
  whole: string
  parts: string[]
}

export const getMatchTerms = (keyword: string, infos: SearchVideoInfo[]): MatchTerm[] => {
  const highlights = new Set<string>()
  infos.forEach(info => {
    for (const [, fragment] of (info.title ?? '').matchAll(keywordHighlightPattern)) {
      const text = normalize(fragment).trim()
      if (text) {
        highlights.add(text)
      }
    }
  })
  const tokens = [...new Set(keyword.toLowerCase().split(/\s+/).filter(Boolean))]
  return tokens.map(token => ({
    whole: token,
    parts: [...highlights].filter(it => it !== token && token.includes(it)),
  }))
}

export const isRelevant = (
  info: SearchVideoInfo,
  terms: MatchTerm[],
  config: { requireAll: boolean; matchTag: boolean },
) => {
  if (terms.length === 0) {
    return true
  }
  const haystack =
    normalize(info.title ?? '') + (config.matchTag ? `\n${normalize(info.tag ?? '')}` : '')
  const matches = (term: MatchTerm) =>
    haystack.includes(term.whole) || term.parts.some(part => haystack.includes(part))
  return config.requireAll ? terms.every(matches) : terms.some(matches)
}

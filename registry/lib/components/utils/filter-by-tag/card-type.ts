/**
 * 首页卡片分类识别.
 *
 * 首页的卡片本身不带统一的类型字段, 只能按类名、角标文字和卡片里链接的域名综合判断.
 * 分类 id 与 common.ts 里 BLOCK_CATEGORIES 的 id 对应.
 */

/** 角标文字 → 分类 id. 只收录能明确归类的, 其余分区名不动 */
const BADGE_TYPE_MAP: Record<string, string> = {
  直播: 'live',
  课堂: 'cheese',
  番剧: 'bangumi',
  国创: 'bangumi',
  电影: 'cinema',
  电视剧: 'cinema',
  影视: 'cinema',
  综艺: 'variety',
  纪录片: 'documentary',
  漫画: 'manga',
  专栏: 'column',
  赛事: 'activity',
  活动: 'activity',
}

const BADGE_SELECTOR = [
  '.badge',
  '.bili-cover-card__badge',
  '.bili-video-card__info--icon-text',
].join(', ')

const AD_SELECTOR = [
  '.bili-video-card__info--ad',
  '.bili-video-card__info--creative-ad',
  '.ad-feedback-entry',
].join(', ')

const getHrefs = (card: HTMLElement) =>
  Array.from(card.querySelectorAll<HTMLAnchorElement>('a[href]')).map(link => link.href)

/** 识别卡片分类, 认不出来时返回 null (按普通视频处理) */
export const getCardType = (card: HTMLElement): string | null => {
  // 直播: 有的布局是独立的 .bili-live-card, 有的复用视频卡片但链到直播间
  if (card.classList.contains('bili-live-card')) {
    return 'live'
  }
  const hrefs = getHrefs(card)
  const hasHref = (pattern: string) => hrefs.some(href => href.includes(pattern))
  // 首页的直播卡片是 .floor-single-card, 角标可能为空, 只能靠链接判断.
  // `live_from=` 是直播间链接特有的查询参数, 比域名更可靠 (域名偶尔会变).
  if (hasHref('live.bilibili.com') || hasHref('live_from=')) {
    return 'live'
  }

  // 广告 / 推广
  if (card.querySelector(AD_SELECTOR) !== null) {
    return 'ad'
  }

  // 角标文字最直观, 优先于链接判断
  const badge = card.querySelector(BADGE_SELECTOR)
  if (badge !== null) {
    const text = (badge.textContent ?? '').trim()
    const type = BADGE_TYPE_MAP[text]
    if (type !== undefined) {
      return type
    }
  }

  // 链接域名 / 路径兜底
  if (card.querySelector('.pugv-tag') !== null || hasHref('/cheese/')) {
    return 'cheese'
  }
  if (hasHref('manga.bilibili.com')) {
    return 'manga'
  }
  if (hasHref('/bangumi/play/')) {
    return 'bangumi'
  }
  if (hasHref('/read/cv')) {
    return 'column'
  }
  if (hasHref('/festival/')) {
    return 'activity'
  }
  return null
}

const UP_NAME_SELECTORS = [
  '.bili-video-card__info--author',
  '.bili-live-card__info--uname',
  '.bili-cover-card__info--author',
  '[class*="uname"]',
  '[class*="up-name"]',
  '[class*="upname"]',
  '[class*="info-container"] a[href*="space.bilibili.com"]',
  'a[href*="space.bilibili.com"]',
]

/** 取卡片上的 UP 主名称, 取不到返回空串 */
export const getUpName = (card: HTMLElement): string => {
  for (const selector of UP_NAME_SELECTORS) {
    const element = card.querySelector(selector)
    const text = (element?.textContent ?? '').trim()
    if (text.length > 0) {
      return text
    }
  }
  return ''
}

const normalize = (text: string) => text.trim().toLowerCase()

/**
 * 判断 UP 主是否在白名单内.
 * 先做完全相等比较; 再允许白名单项作为名称的一部分 (容忍卡片里混进关注按钮等文字),
 * 但白名单项至少要有 2 个字符, 避免单个字误伤.
 */
export const isWhitelisted = (upName: string, whitelist: string[]): boolean => {
  const name = normalize(upName)
  if (name.length === 0) {
    return false
  }
  return whitelist.some(entry => {
    const target = normalize(entry)
    if (target.length === 0) {
      return false
    }
    if (name === target) {
      return true
    }
    return target.length >= 2 && name.includes(target)
  })
}

/**
 * 兜底: UP 主名称选择器没覆盖到新布局时, 直接在整张卡片的文字里找白名单项.
 *
 * 首页直播卡片 (`.floor-single-card`) 的结构不固定, UP 主名可能藏在
 * `.info-container` 里的任意元素中, 拿不到精确选择器时用这个办法保证白名单仍然生效.
 * 代价是房间标题里恰好出现白名单名字时会被误放行 (属于偏宽松的方向).
 */
export const hasWhitelistedText = (card: HTMLElement, whitelist: string[]): boolean => {
  const text = normalize(card.textContent ?? '')
  if (text.length === 0) {
    return false
  }
  return whitelist.some(entry => {
    const target = normalize(entry)
    return target.length >= 2 && text.includes(target)
  })
}

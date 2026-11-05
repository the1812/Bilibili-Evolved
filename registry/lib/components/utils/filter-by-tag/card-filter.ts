import { allMutationsOn } from '@/core/observer'
import { Toast } from '@/core/toast'
import { getCardType, getUpName, hasWhitelistedText, isWhitelisted } from './card-type'
import { BLOCK_CATEGORIES } from './common'
import { matchTag } from './matcher'
import { getTags } from './tag-cache'

const HIDDEN_CLASS = 'be-filter-by-tag-hidden'
/** 隐藏原因, 方便在 devtools 里查看是被哪条规则命中的 */
const HIT_ATTRIBUTE = 'data-be-filter-by-tag'
/** 实际被加 class 的那一层, 排查「留下空白格子」时用 */
const TARGET_ATTRIBUTE = 'data-be-filter-by-tag-target'
/** 卡片查询与标签请求都比较碎, 用防抖合并 MutationObserver 的密集回调 */
const SCAN_DEBOUNCE = 250

/**
 * 各页面的视频卡片容器.
 * - 首页推荐流 / 搜索页 / 空间页: `.bili-video-card`
 * - 首页封面型卡片 (直播/番剧/活动等): `.bili-cover-card`
 * - 搜索页旧版条目: `.video-list-item`
 * - 视频页右侧相关推荐: `.video-page-card-small`, `.recommend-video-card`
 * - 新版播放器 (React) 的推荐条目: `RecommendItem_wrap__xxxx`
 * - 首页直播卡片: `.bili-live-card`
 * - 首页「楼层」卡片 (直播/番剧/课堂等): `.floor-single-card`
 */
const CARD_SELECTOR = [
  '.bili-video-card',
  '.bili-cover-card',
  '.video-list-item',
  '.video-page-card-small',
  '.recommend-video-card',
  '.bili-live-card',
  '.floor-single-card',
  '[class^="RecommendItem_wrap"]',
  '[class^="recommend-list"] .video-page-card',
].join(', ')

/**
 * 网格 / 列表容器. 卡片占的位置是它的**直接子元素** (首页是 `.container > .feed-card`),
 * 隐藏必须停在容器下面一层:
 * - 只隐藏卡片本身 → 外层格子还在, 留下空白卡片
 * - 隐藏到容器 → 整栏内容全没
 */
const GRID_CONTAINER_SELECTOR = [
  '.container',
  '.bili-grid',
  '.bili-layout',
  '.bili-feed',
  '.feed2',
  '.feed-container',
  '.recommend-list',
  '.video-list',
  '.search-page',
  '.bili-dyn-list',
  '#reco_list',
].join(', ')

/** 这些类名本身就是「一个格子」, 从卡片往上爬时可以跨过它 */
const FEED_ITEM_CLASSES = [
  'feed-card',
  'bili-feed-card',
  'video-list-item',
  'bili-live-card',
  'floor-single-card',
  'bili-video-card',
  'bili-cover-card',
  'video-page-card-small',
  'recommend-video-card',
]

const LINK_SELECTOR = [
  '.bili-video-card__info--tit a',
  '.bili-video-card__title a',
  '.pic a',
  '.pic-box a',
  '.info a',
  'a[href*="/video/BV"]',
].join(', ')

const BVID_REGEXP = /\/video\/(BV[0-9A-Za-z]{10})/

/** 当前生效的全部规则, 变化时整个重新判定 */
export interface FilterRules {
  blockedTags: string[]
  blockedTypes: string[]
  whitelist: string[]
}

const getCategoryName = (id: string) =>
  BLOCK_CATEGORIES.find(category => category.id === id)?.displayName ?? id

const getBvid = (element: HTMLElement) => {
  const link = element.querySelector<HTMLAnchorElement>(LINK_SELECTOR)
  if (link === null) {
    return null
  }
  const matched = link.href.match(BVID_REGEXP)
  return matched === null ? null : matched[1]
}

const hasCard = (element: Element) =>
  element.matches(CARD_SELECTOR) || element.querySelector(CARD_SELECTOR) !== null

const countCards = (element: HTMLElement) => element.querySelectorAll(CARD_SELECTOR).length

/** 兄弟节点里还有别的卡片 → 当前元素处在「一排卡片」里, 它是其中一个格子 */
const hasCardSibling = (element: HTMLElement) => {
  const parent = element.parentElement
  if (parent === null) {
    return false
  }
  return Array.from(parent.children).some(sibling => sibling !== element && hasCard(sibling))
}

/**
 * 找到真正该隐藏的那一层: 卡片往上爬到「网格容器的直接子元素」.
 *
 * 只用 closest 是不行的: `.bili-live-card` / `.floor-single-card` 既是卡片、
 * 又可能被 `.feed-card` 包住, closest 会命中卡片自己, 于是外层格子空下来,
 * 表现为「内容没了但留下一个空白卡片」.
 *
 * 爬升规则 (最多 3 层, 碰到 body / 网格容器就停):
 * - 已知的格子类名 (feed-card / floor-single-card / bili-live-card ...) 直接算一层格子,
 *   不管它里面塞了几张卡片 —— 首页的直播常常是 floor-single-card > bili-live-card 两层
 * - 不认识的容器只有在「里面只有一张卡片, 且它处在一排卡片里」时才当作格子,
 *   避免把整个列表/整栏当成一个格子全隐藏掉
 */
const resolveTarget = (card: HTMLElement) => {
  let target = card
  let node: HTMLElement | null = card.parentElement
  for (let depth = 0; node !== null && depth < 3; depth += 1) {
    if (node === document.body || node === document.documentElement) {
      break
    }
    if (node.matches(GRID_CONTAINER_SELECTOR)) {
      break
    }
    // 固定住本轮引用, 避免闭包里读到下一次循环的 node
    const current: HTMLElement = node
    const isKnownItem = FEED_ITEM_CLASSES.some(name => current.classList.contains(name))
    if (!isKnownItem && (countCards(current) > 1 || !hasCardSibling(current))) {
      break
    }
    target = current
    node = current.parentElement
  }
  return target
}

const describeTarget = (element: HTMLElement) => {
  const className = element.getAttribute('class') ?? ''
  return `${element.tagName.toLowerCase()}.${className
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join('.')}`.slice(0, 120)
}

/** 上一次判定的结果, 用于跳过没变化的卡片, 以及站方重渲染后补回隐藏 */
interface ScanState {
  signature: string
  hidden: boolean
}

/**
 * 卡片屏蔽控制器.
 *
 * 设计约束 (重要): 本组件只做「展示层」过滤, 不改变 b 站原有的推荐规则.
 * - 只给我们自己加的 class / data 属性做增删, **绝不** 删除节点、清空或改写卡片内容、移动节点
 *   (节点留在 DOM 里, 站方的翻页计数、推荐流加载逻辑都照常工作)
 * - 不打乱推荐顺序, 不重新请求推荐流, 不调用「不感兴趣」之类的反馈接口
 * - 唯一的网络请求是按 bvid 查标签的只读 GET (见 tag-cache.ts), 只用于判断该不该隐藏
 * - 关闭时把 class 和标记属性全部移除, 页面回到组件未运行时的状态
 *
 * `start` / `stop` 必须成对调用, 对应组件的 `reload` / `unload`.
 */
export class TagFilterController {
  private observer: MutationObserver | null = null
  private timer: ReturnType<typeof setTimeout> | null = null
  private running = false
  /** 每次规则变化都会自增, 用于丢弃过期的异步结果 */
  private epoch = 0
  /** 以隐藏目标为键, 避免同一个格子被内层卡片和外层容器重复处理 */
  private scanned = new WeakMap<HTMLElement, ScanState>()
  /** 卡片 → 实际隐藏层, 免得上百张卡片每次都重新往上爬 */
  private targets = new WeakMap<HTMLElement, HTMLElement>()
  /** 正在等标签接口返回的卡片, 防止并发重复请求 */
  private pending = new WeakSet<HTMLElement>()

  constructor(private readonly getRules: () => FilterRules) {}

  private getRulesSignature() {
    const rules = this.getRules()
    return JSON.stringify([rules.blockedTags, rules.blockedTypes, rules.whitelist])
  }

  start() {
    if (this.running) {
      return
    }
    this.running = true
    this.epoch += 1
    this.resetState()
    const [observer] = allMutationsOn(document.body, records => this.onMutations(records))
    this.observer = observer
    this.scan()
    this.warnIfEmpty()
  }

  stop() {
    this.running = false
    this.epoch += 1
    this.observer?.disconnect()
    this.observer = null
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }
    this.restoreAll()
    this.resetState()
  }

  /** 规则变化后重新判断全部卡片 */
  refresh() {
    if (!this.running) {
      return
    }
    this.epoch += 1
    this.resetState()
    this.scan()
  }

  private resetState() {
    this.scanned = new WeakMap<HTMLElement, ScanState>()
    this.targets = new WeakMap<HTMLElement, HTMLElement>()
  }

  private warnIfEmpty() {
    const rules = this.getRules()
    if (rules.blockedTags.length === 0 && rules.blockedTypes.length === 0) {
      Toast.info('还没有配置任何屏蔽规则, 前往 设置 → 按标签屏蔽视频 里配置', '按标签屏蔽视频')
    }
  }

  /**
   * 只关心节点增删. 播放器的进度时间、弹幕之类只改文本或属性,
   * 视频页那种每秒都在抖的页面不需要跟着重扫.
   */
  private onMutations(records: MutationRecord[]) {
    if (records.length === 0) {
      // allMutationsOn 注册后会立刻用空 records 调一次
      this.scheduleScan()
      return
    }
    if (records.some(record => record.type === 'childList')) {
      this.scheduleScan()
    }
  }

  private scheduleScan() {
    if (this.timer !== null) {
      return
    }
    this.timer = setTimeout(() => {
      this.timer = null
      this.scan()
    }, SCAN_DEBOUNCE)
  }

  private scan() {
    if (!this.running) {
      return
    }
    const rules = this.getRules()
    if (rules.blockedTags.length === 0 && rules.blockedTypes.length === 0) {
      // 没有规则时把之前隐藏的卡片全部恢复
      this.restoreAll()
      return
    }
    const signature = this.getRulesSignature()
    const { epoch } = this
    const seen = new Set<HTMLElement>()
    document.querySelectorAll<HTMLElement>(CARD_SELECTOR).forEach(card => {
      if (!card.isConnected) {
        return
      }
      const target = this.resolveTarget(card)
      if (seen.has(target)) {
        return
      }
      seen.add(target)
      this.processCard(target, epoch, signature, rules)
    })
  }

  private resolveTarget(card: HTMLElement) {
    const cached = this.targets.get(card)
    if (cached !== undefined && cached.isConnected) {
      return cached
    }
    const target = resolveTarget(card)
    this.targets.set(card, target)
    return target
  }

  /**
   * 还需要处理吗?
   * - 规则没变且上次是显示 → 跳过
   * - 规则没变且上次是隐藏, 但 class 被站方重渲染冲掉了 → 重新补上
   */
  private needsProcess(target: HTMLElement, signature: string) {
    const state = this.scanned.get(target)
    if (state === undefined || state.signature !== signature) {
      return true
    }
    if (!state.hidden) {
      return false
    }
    return !target.classList.contains(HIDDEN_CLASS)
  }

  private async processCard(
    target: HTMLElement,
    epoch: number,
    signature: string,
    rules: FilterRules,
  ) {
    if (!this.needsProcess(target, signature)) {
      return
    }
    const type = getCardType(target)
    if (type === 'live') {
      // 直播卡片没有 bvid, 不参与标签匹配; 白名单内的 UP 主开启直播时放行
      const whitelisted =
        isWhitelisted(getUpName(target), rules.whitelist) ||
        hasWhitelistedText(target, rules.whitelist)
      if (whitelisted) {
        this.show(target, signature)
        return
      }
      if (rules.blockedTypes.includes('live')) {
        this.hide(target, getCategoryName('live'), signature)
      } else {
        this.show(target, signature)
      }
      return
    }

    if (type !== null && rules.blockedTypes.includes(type)) {
      this.hide(target, getCategoryName(type), signature)
      return
    }

    if (rules.blockedTags.length === 0) {
      this.show(target, signature)
      return
    }
    const bvid = getBvid(target)
    if (bvid === null) {
      this.show(target, signature)
      return
    }
    if (this.pending.has(target)) {
      return
    }
    this.pending.add(target)
    const tags = await getTags(bvid)
    this.pending.delete(target)
    if (!this.running || epoch !== this.epoch) {
      return
    }
    if (tags === null) {
      // 查询失败, 清掉标记, 下次节点变化时会重试
      this.scanned.delete(target)
      return
    }
    const result = matchTag(tags, rules.blockedTags)
    if (result.matched) {
      this.hide(target, result.tag, signature)
    } else {
      this.show(target, signature)
    }
  }

  private hide(target: HTMLElement, reason: string, signature: string) {
    // 只加 class 和标记属性: 不删节点、不清空 innerHTML、不移动节点
    target.classList.add(HIDDEN_CLASS)
    target.setAttribute(HIT_ATTRIBUTE, reason)
    target.setAttribute(TARGET_ATTRIBUTE, describeTarget(target))
    this.scanned.set(target, { signature, hidden: true })
  }

  private show(target: HTMLElement, signature: string) {
    target.classList.remove(HIDDEN_CLASS)
    target.removeAttribute(HIT_ATTRIBUTE)
    target.removeAttribute(TARGET_ATTRIBUTE)
    this.scanned.set(target, { signature, hidden: false })
  }

  /** 只还原本组件加过的 class 和属性, 不碰站方自己的任何状态 */
  private restoreAll() {
    document.querySelectorAll<HTMLElement>(`.${HIDDEN_CLASS}`).forEach(target => {
      target.classList.remove(HIDDEN_CLASS)
      target.removeAttribute(HIT_ATTRIBUTE)
      target.removeAttribute(TARGET_ATTRIBUTE)
    })
  }
}

/**
 * 推荐位 / 稍后再看卡片快合按钮宿主
 *
 * 负责 DOM 观察、Vue 挂载与合并 / 移除逻辑。
 */
import { mountVueComponent } from '@/core/utils'
import { addStyle, removeStyle } from '@/core/style'
import { dmWarn } from '../danmaku/log'
import { QUICK_MERGE_BUTTON_EVENTS } from './contracts'
import { mergerToast } from './notify'

const QUICK_MERGE_STYLE_NAME = 'danmakuMergerQuickMerge'

const ensureQuickMergeStyles = async (): Promise<void> => {
  const { default: css } = await import('./quick-merge.scss')
  addStyle(css, QUICK_MERGE_STYLE_NAME)
}

/** 封面容器选择器 */
const PIC_SELECTORS = [
  '.pic-box',
  '.video-card .pic',
  '.video-card-common .pic',
  '.bili-video-card__cover',
  '.bili-video-card .cover',
  '.recommend-video-card .pic-box',
  '.card-box .pic-box',
].join(', ')

const CARD_SELECTORS =
  '.video-page-card-small, .video-card, .video-card-common, .bili-video-card, .recommend-video-card'

const BV_PATTERN = /(BV[a-zA-Z0-9]{10})/i

type QuickMergeVm = Vue & {
  merged?: boolean
  busy?: boolean
}

export interface QuickMergeHostDeps {
  getSources: () => Array<{ bvid?: string }>
  removeSource: (id: string) => void
  api: {
    getView: (id: string) => Promise<{
      bvid: string
      title: string
      pic: string
      owner?: { name: string }
      pages?: Array<{ cid: number; part: string; page: number }>
    }>
    getDanmaku: (cid: number | string) => Promise<string>
  }
  parseDanmaku: (xml: string) => Array<{ time: number; text: string }>
  injectDanmaku: (
    list: Array<{ time: number; text: string }>,
    meta: Record<string, unknown>,
    silent?: boolean,
  ) => Promise<{
    ok: boolean
    count: number
    screen: number
    list: boolean
    reason?: string
  }>
  formatInjectHint: (result: {
    count: number
    screen: number
    list: boolean
    firstSec?: number | null
  }) => string
  /** 弹幕源变更时刷新角标等 UI */
  onSourcesUpdated?: () => void
}

interface MountedQuickMerge {
  vm: Vue
  bvid: string | null
}

export const createQuickMergeHost = (deps: QuickMergeHostDeps) => {
  const mounted = new Map<Element, MountedQuickMerge>()
  let domObserver: MutationObserver | null = null
  let quickMergeModule: { default: unknown } | null = null
  let sourcesListener: (() => void) | null = null

  const isBvidMerged = (bvid: string | null): boolean => {
    if (!bvid) {
      return false
    }
    return deps.getSources().some(s => s.bvid === bvid)
  }

  const extractBvidFromPic = (pic: Element): string | null => {
    const card = pic.closest(CARD_SELECTORS)
    const link = card?.querySelector('a')?.href
    const match = link?.match(BV_PATTERN)
    return match ? match[1] : null
  }

  const refreshAll = () => {
    mounted.forEach(({ vm, bvid }) => {
      Object.assign(vm, { merged: isBvidMerged(bvid) })
    })
    deps.onSourcesUpdated?.()
  }

  const handleToggle = async (bvid: string, vm: QuickMergeVm) => {
    const entry = [...mounted.entries()].find(([, m]) => m.vm === vm)
    if (!entry) {
      return
    }

    Object.assign(vm, { busy: true })

    try {
      if (vm.merged) {
        const data = await deps.api.getView(bvid)
        if (data.pages?.length) {
          deps.removeSource(`${bvid}_${data.pages[0].cid}`)
          mergerToast('已移除并入弹幕')
        }
        return
      }

      const data = await deps.api.getView(bvid)
      if (!data.pages?.length) {
        return
      }

      const p1 = data.pages[0]
      const xml = await deps.api.getDanmaku(p1.cid)
      const list = deps.parseDanmaku(xml)

      const result = await deps.injectDanmaku(
        list,
        {
          id: `${bvid}_${p1.cid}`,
          cid: p1.cid,
          bvid,
          title: data.title + (data.pages.length > 1 ? ' P1' : ''),
          pic: data.pic,
          author: data.owner?.name || '',
          groupTitle: data.title,
        },
        true,
      )

      if (result.ok) {
        const hint = deps.formatInjectHint(result)
        mergerToast(`已并入：${data.title}${hint ? `（${hint}）` : ''}`)
      } else {
        mergerToast(`并入失败：${data.title}`, 'error')
      }
    } catch (err) {
      console.error('快速合并失败:', err)
      mergerToast(vm.merged ? '移除失败' : '合并失败', 'error')
    } finally {
      Object.assign(vm, { busy: false })
    }
  }

  const mountOnPic = (pic: Element) => {
    if (pic.querySelector('.dm-quick-merge-btn')) {
      return
    }
    if (!quickMergeModule) {
      return
    }

    const bvid = extractBvidFromPic(pic)
    const vm = mountVueComponent(quickMergeModule) as Vue & {
      bvid: string
      merged: boolean
      busy: boolean
    }

    Object.assign(vm, {
      bvid: bvid || '',
      merged: isBvidMerged(bvid),
      busy: false,
    })

    vm.$on(QUICK_MERGE_BUTTON_EVENTS.TOGGLE_MERGE, ({ bvid: bv }: { bvid: string }) => {
      handleToggle(bv, vm)
    })

    pic.appendChild(vm.$el)
    mounted.set(pic, { vm, bvid })
  }

  const scanAndMount = () => {
    document.querySelectorAll(PIC_SELECTORS).forEach(pic => mountOnPic(pic))
  }

  const init = async () => {
    try {
      await ensureQuickMergeStyles()
      quickMergeModule = await import('./QuickMergeButton.vue')
    } catch (error) {
      dmWarn('快合按钮组件加载失败', error)
      return
    }

    sourcesListener = () => refreshAll()
    document.addEventListener('dm-sources-updated', sourcesListener)

    domObserver = new MutationObserver(() => scanAndMount())
    domObserver.observe(document.body, { childList: true, subtree: true })

    scanAndMount()
  }

  const destroy = () => {
    if (sourcesListener) {
      document.removeEventListener('dm-sources-updated', sourcesListener)
      sourcesListener = null
    }
    domObserver?.disconnect()
    domObserver = null

    mounted.forEach(({ vm }) => {
      vm.$destroy()
      vm.$el?.parentNode?.removeChild(vm.$el)
    })
    mounted.clear()
    quickMergeModule = null
    removeStyle(QUICK_MERGE_STYLE_NAME)
  }

  const getDebugInfo = () => ({
    mounted: mounted.size,
    picTargets: document.querySelectorAll(PIC_SELECTORS).length,
    buttons: document.querySelectorAll('.dm-quick-merge-btn').length,
    styleReady: [...document.styleSheets].some(sheet => {
      try {
        return [...sheet.cssRules].some(
          rule => rule.cssText?.includes('dm-quick-merge-btn') && rule.cssText?.includes('opacity'),
        )
      } catch {
        return false
      }
    }),
  })

  return { init, destroy, refreshAll, getDebugInfo }
}

/** runtime 集成用：一行初始化快合宿主 */
export const initQuickMerge = (deps: QuickMergeHostDeps) => {
  const host = createQuickMergeHost(deps)
  host.init().catch(error => dmWarn('快合宿主初始化失败', error))
  return host
}

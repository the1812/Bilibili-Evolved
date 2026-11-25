import { mutationObserve } from '@/core/observer'
import {
  extractDanmakuText,
  extractSelfBorderColor,
  filterNestedDanmaku,
  isRollDanmakuElement,
  normalizeDanmakuText,
} from './dom'
import type { LiveDanmakuMergeOptions } from './options'
import {
  NodeStateManager,
  createDanmakuRenderer,
  createNodeStateManager,
  isBadgeVisible,
} from './renderer'
import {
  ACTIVE_INSTANCE_ATTR,
  ActiveLeaderItem,
  BADGE_CLASS,
  BADGE_HIDDEN_CLASS,
  BADGE_NUM_HIDDEN_CLASS,
  BADGE_SYMBOL_HIDDEN_CLASS,
  DANMAKU_CONTAINER_SELECTOR,
  DanmakuNodeState,
  DanmakuRole,
  DanmakuRoleType,
  DocInstance,
  INFLATED_CLASS,
  MERGED_HIDDEN_CLASS,
  NUM_SCALE_VAR,
  ROLL_DANMAKU_SELECTOR,
  SELF_MERGED_CLASS,
  SUBDOC_STYLE_ID,
  SYMBOL_SCALE_VAR,
  TAKEOVER_EVENT,
} from './types'

const CONTAINER_OBSERVER_CONFIG: MutationObserverInit = {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class'],
}

const BODY_OBSERVER_CONFIG: MutationObserverInit = {
  childList: true,
  subtree: true,
}

export const applyScaleCssVars = (targetDoc: Document, options: LiveDanmakuMergeOptions) => {
  const docEl = targetDoc.documentElement
  if (!docEl) {
    return
  }
  const symbolScale = Math.max(0, options.badgeSymbolScaleRatio)
  const numScale = Math.max(0, options.badgeNumScaleRatio)
  docEl.style.setProperty(SYMBOL_SCALE_VAR, String(symbolScale / 100))
  docEl.style.setProperty(NUM_SCALE_VAR, String(numScale / 100))
  docEl.classList.toggle(BADGE_SYMBOL_HIDDEN_CLASS, symbolScale <= 0)
  docEl.classList.toggle(BADGE_NUM_HIDDEN_CLASS, numScale <= 0)
  docEl.classList.toggle(BADGE_HIDDEN_CLASS, symbolScale <= 0 && numScale <= 0)
}

const clearScaleCssVars = (targetDoc: Document) => {
  const docEl = targetDoc.documentElement
  if (!docEl) {
    return
  }
  docEl.style.removeProperty(SYMBOL_SCALE_VAR)
  docEl.style.removeProperty(NUM_SCALE_VAR)
  docEl.classList.remove(BADGE_HIDDEN_CLASS, BADGE_SYMBOL_HIDDEN_CLASS, BADGE_NUM_HIDDEN_CLASS)
}

export const ensureSubDocStyle = (
  targetDoc: Document,
  cssText: string,
  defaultStyleId: string,
): HTMLStyleElement | null => {
  if (targetDoc === document || !targetDoc.defaultView || targetDoc.defaultView.closed) {
    return null
  }
  // 清理子框架可能预加载的冗余 instantStyle，统一由主文档控制样式生命周期
  targetDoc.getElementById(defaultStyleId)?.remove()
  const existing = targetDoc.getElementById(SUBDOC_STYLE_ID)
  if (existing) {
    return existing as HTMLStyleElement
  }
  const styleEl = targetDoc.createElement('style')
  styleEl.id = SUBDOC_STYLE_ID
  styleEl.setAttribute('data-be-style', '')
  styleEl.textContent = cssText
  const root = targetDoc.head || targetDoc.documentElement || targetDoc.body
  if (!root) {
    return null
  }
  root.appendChild(styleEl)
  return styleEl
}

const isLeaderAlive = (
  nodeStateMgr: NodeStateManager,
  normKey: string,
  item: ActiveLeaderItem,
  now: number,
): boolean => {
  const state = nodeStateMgr.get(item.el)
  return Boolean(
    item.el &&
      item.el.isConnected &&
      item.el.classList.contains('bili-danmaku-x-show') &&
      now - item.birthTime <= item.maxMergeAgeMs &&
      state &&
      state.role === DanmakuRole.LEADER &&
      state.normKey === normKey,
  )
}

const buildNodeState = (
  role: DanmakuRoleType,
  normKey: string,
  rawText: string,
  now: number,
  durationMs: number,
  extra: Partial<DanmakuNodeState> = {},
): DanmakuNodeState => ({
  role,
  normKey,
  rawText,
  birthTime: now,
  durationMs,
  originalFontSize: null,
  appliedFontSize: null,
  originalCssVarFontSize: null,
  appliedCssVarFontSize: null,
  originalTranslateX: null,
  appliedTranslateX: null,
  translateCompensated: false,
  hasSelfBorder: false,
  selfBorderInherited: false,
  resetAbort: new AbortController(),
  ...extra,
})

const createDanmakuProcessor = (
  targetDoc: Document,
  getOptions: () => LiveDanmakuMergeOptions,
  nodeStateMgr: NodeStateManager,
  activeDanmakus: Map<string, ActiveLeaderItem>,
  rootAbortSignal: AbortSignal,
) => {
  const renderer = createDanmakuRenderer(targetDoc, getOptions)

  const cleanupActive = () => {
    const now = Date.now()
    for (const [key, item] of activeDanmakus.entries()) {
      if (!isLeaderAlive(nodeStateMgr, key, item, now)) {
        activeDanmakus.delete(key)
      }
    }
  }

  const findTarget = (normKey: string): ActiveLeaderItem | null => {
    const item = activeDanmakus.get(normKey)
    if (!item) {
      return null
    }
    if (!isLeaderAlive(nodeStateMgr, normKey, item, Date.now())) {
      activeDanmakus.delete(normKey)
      return null
    }
    return item
  }

  const bindAnimationReset = (node: HTMLElement, state: DanmakuNodeState) => {
    const onRootAbort = () => state.resetAbort.abort()
    rootAbortSignal.addEventListener('abort', onRootAbort, { once: true })
    state.detachRootAbort = () => {
      rootAbortSignal.removeEventListener('abort', onRootAbort)
    }

    node.addEventListener(
      'animationend',
      event => {
        if (event.target === node && nodeStateMgr.get(node) === state) {
          nodeStateMgr.reset(node, activeDanmakus)
        }
      },
      { signal: state.resetAbort.signal },
    )
  }

  const shouldSkipExistingNode = (
    node: HTMLElement,
    state: DanmakuNodeState,
    now: number,
    fromContentMutation: boolean,
  ): boolean => {
    if (fromContentMutation) {
      return false
    }
    if (
      state.role === DanmakuRole.FOLLOWER &&
      node.classList.contains(MERGED_HIDDEN_CLASS) &&
      now - state.birthTime <= state.durationMs
    ) {
      return true
    }
    return state.role === DanmakuRole.LEADER && activeDanmakus.get(state.normKey)?.el === node
  }

  const processDanmakuNode = (node: HTMLElement, fromContentMutation = false) => {
    if (!isRollDanmakuElement(node)) {
      return
    }
    if (!node.classList.contains('bili-danmaku-x-show')) {
      if (nodeStateMgr.has(node)) {
        nodeStateMgr.reset(node, activeDanmakus)
      }
      return
    }

    const existingState = nodeStateMgr.get(node)
    const now = Date.now()
    if (existingState && shouldSkipExistingNode(node, existingState, now, fromContentMutation)) {
      return
    }

    const rawText = extractDanmakuText(node)
    if (!rawText) {
      if (existingState) {
        nodeStateMgr.reset(node, activeDanmakus)
      }
      return
    }

    if (existingState) {
      const isExpired =
        existingState.birthTime > 0 && now - existingState.birthTime > existingState.durationMs
      if (existingState.rawText !== rawText || isExpired) {
        nodeStateMgr.reset(node, activeDanmakus)
      }
    }
    if (nodeStateMgr.has(node)) {
      return
    }

    const normKey = normalizeDanmakuText(rawText)
    if (!normKey) {
      return
    }

    const existingTarget = findTarget(normKey)
    if (existingTarget && existingTarget.el !== node && existingTarget.el.isConnected) {
      const durationMs = renderer.resolveDurationMs(node)
      const selfBorderColor = extractSelfBorderColor(node)
      const followerState = buildNodeState(
        DanmakuRole.FOLLOWER,
        normKey,
        rawText,
        now,
        durationMs,
        {
          hasSelfBorder: Boolean(selfBorderColor),
        },
      )
      nodeStateMgr.set(node, followerState)
      node.classList.add(MERGED_HIDDEN_CLASS)
      bindAnimationReset(node, followerState)

      existingTarget.count += 1
      const leaderState = nodeStateMgr.get(existingTarget.el)
      if (leaderState) {
        renderer.inflate(existingTarget, leaderState)
        if (selfBorderColor) {
          renderer.inheritSelfBorder(existingTarget.el, leaderState, selfBorderColor)
        }
      }
      return
    }

    const baseFontSize = renderer.resolveBaseFontSize(node)
    const durationMs = renderer.resolveDurationMs(node)
    const maxMergeAgeMs = Math.round(durationMs * (getOptions().mergeDistanceRatio / 100))
    const leaderState = buildNodeState(DanmakuRole.LEADER, normKey, rawText, now, durationMs, {
      originalFontSize: node.style.fontSize || null,
      originalCssVarFontSize: node.style.getPropertyValue('--fontSize') || null,
      hasSelfBorder: Boolean(extractSelfBorderColor(node)),
    })
    nodeStateMgr.set(node, leaderState)

    activeDanmakus.set(normKey, {
      el: node,
      count: 1,
      birthTime: now,
      durationMs,
      maxMergeAgeMs,
      rawText,
      baseFontSize,
    })
    bindAnimationReset(node, leaderState)
  }

  return {
    renderer,
    cleanupActive,
    processDanmakuNode,
  }
}

const isOnlyBadgeMutations = (list: NodeList): boolean => {
  if (list.length === 0) {
    return false
  }
  for (let i = 0; i < list.length; i++) {
    const n = list[i]
    if (n.nodeType !== Node.ELEMENT_NODE || !(n as Element).classList.contains(BADGE_CLASS)) {
      return false
    }
  }
  return true
}

const createContainerMutationHandler = (
  getBoundContainer: () => Element | null,
  nodeStateMgr: NodeStateManager,
  activeDanmakus: Map<string, ActiveLeaderItem>,
  processDanmakuNode: (node: HTMLElement, fromContentMutation?: boolean) => void,
): MutationCallback => {
  const handleSubtreeMutation = (m: MutationRecord, boundContainer: Element | null) => {
    const targetEl = (
      m.target.nodeType === Node.ELEMENT_NODE ? m.target : m.target.parentNode
    ) as Element | null
    if (!targetEl || targetEl.closest?.(`.${BADGE_CLASS}`)) {
      return
    }
    if (
      (isOnlyBadgeMutations(m.addedNodes) && m.removedNodes.length === 0) ||
      (isOnlyBadgeMutations(m.removedNodes) && m.addedNodes.length === 0)
    ) {
      return
    }
    const dmEl = targetEl.closest?.(ROLL_DANMAKU_SELECTOR) as HTMLElement | null
    if (dmEl && isRollDanmakuElement(dmEl) && dmEl.parentNode === boundContainer) {
      processDanmakuNode(dmEl, true)
    }
  }

  const handleRemovedNodes = (nodes: NodeList) => {
    for (let i = 0; i < nodes.length; i++) {
      const removed = nodes[i]
      if (removed.nodeType !== Node.ELEMENT_NODE) {
        continue
      }
      const el = removed as HTMLElement
      if (isRollDanmakuElement(el)) {
        nodeStateMgr.reset(el, activeDanmakus)
      } else {
        el.querySelectorAll<HTMLElement>(ROLL_DANMAKU_SELECTOR).forEach(dm =>
          nodeStateMgr.reset(dm, activeDanmakus),
        )
      }
    }
  }

  const handleAddedNodes = (nodes: NodeList) => {
    for (let i = 0; i < nodes.length; i++) {
      const added = nodes[i]
      if (added.nodeType !== Node.ELEMENT_NODE) {
        continue
      }
      const el = added as HTMLElement
      if (isRollDanmakuElement(el)) {
        if (nodeStateMgr.has(el) && !el.classList.contains('bili-danmaku-x-show')) {
          nodeStateMgr.reset(el, activeDanmakus)
        }
        processDanmakuNode(el)
      } else {
        const dms = filterNestedDanmaku(el.querySelectorAll<HTMLElement>(ROLL_DANMAKU_SELECTOR))
        for (let k = 0; k < dms.length; k++) {
          processDanmakuNode(dms[k])
        }
      }
    }
  }

  return mutations => {
    const boundContainer = getBoundContainer()
    for (let i = 0; i < mutations.length; i++) {
      const m = mutations[i]
      if (m.type === 'attributes') {
        const targetEl = m.target as HTMLElement
        if (
          targetEl.nodeType === Node.ELEMENT_NODE &&
          isRollDanmakuElement(targetEl) &&
          (!boundContainer || targetEl.parentNode === boundContainer)
        ) {
          processDanmakuNode(targetEl)
        }
        continue
      }
      if (m.type !== 'childList') {
        continue
      }
      if (boundContainer && m.target !== boundContainer) {
        handleSubtreeMutation(m, boundContainer)
        continue
      }
      handleRemovedNodes(m.removedNodes)
      handleAddedNodes(m.addedNodes)
    }
  }
}

const createBodyMutationHandler =
  (onContainerFound: () => void): MutationCallback =>
  mutations => {
    for (let i = 0; i < mutations.length; i++) {
      const m = mutations[i]
      if (m.type !== 'childList') {
        continue
      }
      for (let j = 0; j < m.addedNodes.length; j++) {
        const added = m.addedNodes[j]
        if (added.nodeType !== Node.ELEMENT_NODE) {
          continue
        }
        const el = added as Element
        if (
          el.matches(DANMAKU_CONTAINER_SELECTOR) ||
          el.querySelector(DANMAKU_CONTAINER_SELECTOR)
        ) {
          onContainerFound()
          return
        }
      }
    }
  }

export const initMergeManagerForDoc = (
  targetDoc: Document,
  getOptions: () => LiveDanmakuMergeOptions,
  loadSubDocCss: () => Promise<string>,
  defaultStyleId: string,
  onInstanceRemoved: (cleanup: () => void) => void,
): DocInstance => {
  const instanceToken = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const targetWin = targetDoc.defaultView || window
  targetDoc.dispatchEvent(
    new targetWin.CustomEvent(TAKEOVER_EVENT, { detail: { token: instanceToken } }),
  )
  targetDoc.documentElement?.setAttribute(ACTIVE_INSTANCE_ATTR, instanceToken)

  applyScaleCssVars(targetDoc, getOptions())

  const nodeStateMgr = createNodeStateManager()
  const activeDanmakus = new Map<string, ActiveLeaderItem>()
  const abortController = new AbortController()
  const { renderer, cleanupActive, processDanmakuNode } = createDanmakuProcessor(
    targetDoc,
    getOptions,
    nodeStateMgr,
    activeDanmakus,
    abortController.signal,
  )

  let boundContainer: Element | null = null
  let observedTarget: Node | null = null
  let observer: MutationObserver | null = null
  let injectedSubDocStyle: HTMLStyleElement | null = null
  let cachedSubDocCss: string | null = null
  let cleaned = false

  const handleContainerMutations = createContainerMutationHandler(
    () => boundContainer,
    nodeStateMgr,
    activeDanmakus,
    processDanmakuNode,
  )

  if (targetDoc !== document) {
    loadSubDocCss().then(cssText => {
      cachedSubDocCss = cssText
      if (!cleaned) {
        injectedSubDocStyle = ensureSubDocStyle(targetDoc, cssText, defaultStyleId)
      }
    })
  }

  const attachToContainer = (container: Element) => {
    observer?.disconnect()
    const [nextObserver] = mutationObserve(
      [container],
      CONTAINER_OBSERVER_CONFIG,
      handleContainerMutations,
    )
    observer = nextObserver
    boundContainer = container
    observedTarget = container

    const dms = filterNestedDanmaku(container.querySelectorAll<HTMLElement>(ROLL_DANMAKU_SELECTOR))
    for (let i = 0; i < dms.length; i++) {
      processDanmakuNode(dms[i])
    }
  }

  const ensureContainerAttached = () => {
    if (cleaned) {
      return
    }
    if (boundContainer && !boundContainer.isConnected) {
      observer?.disconnect()
      observer = null
      boundContainer = null
      observedTarget = null
    }

    const container = targetDoc.querySelector(DANMAKU_CONTAINER_SELECTOR)
    if (container && container !== boundContainer) {
      attachToContainer(container)
      return
    }
    if (
      !boundContainer &&
      targetDoc.body &&
      (observedTarget !== targetDoc.body || !observedTarget.isConnected)
    ) {
      observer?.disconnect()
      const [nextObserver] = mutationObserve(
        [targetDoc.body],
        BODY_OBSERVER_CONFIG,
        createBodyMutationHandler(ensureContainerAttached),
      )
      observer = nextObserver
      observedTarget = targetDoc.body
    }
  }

  let patrolTimer: number | null = null

  const cleanup = () => {
    if (cleaned) {
      return
    }
    cleaned = true
    onInstanceRemoved(cleanup)

    abortController.abort()
    if (patrolTimer !== null) {
      window.clearInterval(patrolTimer)
      patrolTimer = null
    }
    observer?.disconnect()
    observer = null
    observedTarget = null
    boundContainer = null
    activeDanmakus.clear()

    if (!targetDoc.defaultView || targetDoc.defaultView.closed) {
      return
    }
    clearScaleCssVars(targetDoc)
    if (targetDoc !== document) {
      ;(injectedSubDocStyle || targetDoc.getElementById(SUBDOC_STYLE_ID))?.remove()
    }
    if (targetDoc.documentElement?.getAttribute(ACTIVE_INSTANCE_ATTR) === instanceToken) {
      targetDoc.documentElement.removeAttribute(ACTIVE_INSTANCE_ATTR)
    }

    targetDoc
      .querySelectorAll<HTMLElement>(
        `.${MERGED_HIDDEN_CLASS}, .${INFLATED_CLASS}, .${SELF_MERGED_CLASS}`,
      )
      .forEach(node => nodeStateMgr.reset(node, activeDanmakus))
    targetDoc.querySelectorAll<HTMLElement>(`.${BADGE_CLASS}`).forEach(badge => badge.remove())
  }

  targetDoc.addEventListener(
    TAKEOVER_EVENT,
    event => {
      const incomingToken = (event as CustomEvent<{ token?: string }>).detail?.token
      if (incomingToken && incomingToken !== instanceToken) {
        cleanup()
      }
    },
    { signal: abortController.signal },
  )

  ensureContainerAttached()

  // 监听全屏切换，实现瞬时重绑（消除巡检延迟）
  const onFullscreenChange = () => ensureContainerAttached()
  targetDoc.addEventListener('fullscreenchange', onFullscreenChange, {
    signal: abortController.signal,
  })
  targetDoc.addEventListener('webkitfullscreenchange', onFullscreenChange, {
    signal: abortController.signal,
  })

  patrolTimer = window.setInterval(() => {
    if (!targetDoc.defaultView || targetDoc.defaultView.closed) {
      cleanup()
      return
    }
    if (cachedSubDocCss) {
      ensureSubDocStyle(targetDoc, cachedSubDocCss, defaultStyleId)
    }
    cleanupActive()
    ensureContainerAttached()
  }, 2000)

  return {
    targetDoc,
    activeDanmakus,
    syncBadges: () => {
      if (!isBadgeVisible(getOptions())) {
        return
      }
      activeDanmakus.forEach(item => {
        if (item.count > 1 && item.el.isConnected) {
          renderer.ensureBadge(item.el, item.count)
        }
      })
    },
    cleanup,
  }
}

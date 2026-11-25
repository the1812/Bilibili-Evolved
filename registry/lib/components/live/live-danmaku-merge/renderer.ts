import badgeShadowCss from './badge.scss'
import { estimateDisplayLength, extractSelfBorderColor, syncInflatedImages } from './dom'
import type { LiveDanmakuMergeOptions } from './options'
import {
  ActiveLeaderItem,
  BADGE_CLASS,
  DEFAULT_DURATION_MS,
  DM_SCALE_VAR,
  DanmakuNodeState,
  IMG_BASE_H_VAR,
  IMG_BASE_W_VAR,
  IMG_H_SCALED_CLASS,
  IMG_W_SCALED_CLASS,
  INFLATED_CLASS,
  MERGED_HIDDEN_CLASS,
  SELF_BORDER_COLOR_VAR,
  SELF_MERGED_CLASS,
} from './types'

const restoreInflatedStyles = (el: HTMLElement, state: DanmakuNodeState) => {
  if (!el.classList.contains(INFLATED_CLASS)) {
    return
  }
  el.classList.remove(INFLATED_CLASS)
  // 仅当 DOM 上仍是本组件写入的值时才回滚，避免覆盖 B 站对象池复用写入的新弹幕样式
  if (state.appliedFontSize && el.style.fontSize === state.appliedFontSize) {
    if (state.originalFontSize) {
      el.style.fontSize = state.originalFontSize
    } else {
      el.style.removeProperty('font-size')
    }
  }
  if (
    state.appliedCssVarFontSize &&
    el.style.getPropertyValue('--fontSize') === state.appliedCssVarFontSize
  ) {
    if (state.originalCssVarFontSize) {
      el.style.setProperty('--fontSize', state.originalCssVarFontSize)
    } else {
      el.style.removeProperty('--fontSize')
    }
  }
  el.style.removeProperty(DM_SCALE_VAR)

  const scaledImgs = el.querySelectorAll<HTMLImageElement>(
    `img.${IMG_W_SCALED_CLASS}, img.${IMG_H_SCALED_CLASS}`,
  )
  for (let i = 0; i < scaledImgs.length; i++) {
    const img = scaledImgs[i]
    img.classList.remove(IMG_W_SCALED_CLASS, IMG_H_SCALED_CLASS)
    img.style.removeProperty(IMG_BASE_W_VAR)
    img.style.removeProperty(IMG_BASE_H_VAR)
  }
}

export const createNodeStateManager = () => {
  const states = new WeakMap<HTMLElement, DanmakuNodeState>()

  return {
    get: (el: HTMLElement): DanmakuNodeState | undefined => states.get(el),
    set: (el: HTMLElement, state: DanmakuNodeState): void => {
      states.set(el, state)
    },
    has: (el: HTMLElement): boolean => states.has(el),
    reset(el: HTMLElement, activeDanmakus: Map<string, ActiveLeaderItem>): void {
      if (!el) {
        return
      }
      const state = states.get(el)
      if (!state) {
        return
      }

      state.detachRootAbort?.()
      state.resetAbort.abort()

      if (state.normKey && activeDanmakus.get(state.normKey)?.el === el) {
        activeDanmakus.delete(state.normKey)
      }

      el.classList.remove(MERGED_HIDDEN_CLASS, SELF_MERGED_CLASS)
      restoreInflatedStyles(el, state)

      if (state.selfBorderInherited) {
        el.style.removeProperty(SELF_BORDER_COLOR_VAR)
      }
      if (
        state.appliedTranslateX &&
        state.originalTranslateX &&
        el.style.getPropertyValue('--translateX') === state.appliedTranslateX
      ) {
        el.style.setProperty('--translateX', state.originalTranslateX)
      }

      el.querySelector(`.${BADGE_CLASS}`)?.remove()
      states.delete(el)
    },
  }
}

export type NodeStateManager = ReturnType<typeof createNodeStateManager>

export const isBadgeVisible = (options: LiveDanmakuMergeOptions) =>
  options.badgeSymbolScaleRatio > 0 || options.badgeNumScaleRatio > 0

export const createDanmakuRenderer = (
  targetDoc: Document,
  getOptions: () => LiveDanmakuMergeOptions,
) => {
  let cachedBadgeTpl: HTMLTemplateElement | null = null
  let cachedBadgeSheet: CSSStyleSheet | null = null

  const getBadgeTemplate = (): HTMLTemplateElement => {
    if (!cachedBadgeTpl) {
      cachedBadgeTpl = targetDoc.createElement('template')
      const symbolSpan = targetDoc.createElement('span')
      symbolSpan.className = 'badge-symbol'
      symbolSpan.textContent = '×'
      const numSpan = targetDoc.createElement('span')
      numSpan.className = 'badge-num'
      cachedBadgeTpl.content.append(symbolSpan, numSpan)
    }
    return cachedBadgeTpl
  }

  const getBadgeSheet = (): CSSStyleSheet => {
    if (!cachedBadgeSheet) {
      const win = targetDoc.defaultView || window
      cachedBadgeSheet = new win.CSSStyleSheet()
      cachedBadgeSheet.replaceSync(badgeShadowCss)
    }
    return cachedBadgeSheet
  }

  const resolveBaseFontSize = (el: HTMLElement): number => {
    for (const candidate of [el.style.fontSize, el.style.getPropertyValue('--fontSize')]) {
      const parsed = parseFloat(candidate)
      if (parsed > 0) {
        return parsed
      }
    }
    const computed = parseFloat(targetDoc.defaultView?.getComputedStyle(el).fontSize || '')
    return computed > 0 ? computed : 25
  }

  const resolveDurationMs = (el: HTMLElement): number => {
    const inlineDuration = el.style.getPropertyValue('--duration')
    if (inlineDuration) {
      const parsed = parseFloat(inlineDuration)
      if (parsed > 0) {
        return inlineDuration.includes('ms') ? parsed : Math.round(parsed * 1000)
      }
    }
    return DEFAULT_DURATION_MS
  }

  const ensureBadge = (el: HTMLElement, count: number): void => {
    if (!el || !el.isConnected || !isBadgeVisible(getOptions())) {
      return
    }
    let badge = el.querySelector(`.${BADGE_CLASS}`) as HTMLElement | null
    if (!badge) {
      badge = targetDoc.createElement('span')
      badge.className = BADGE_CLASS
      const shadow = badge.attachShadow({ mode: 'open' })
      shadow.adoptedStyleSheets = [getBadgeSheet()]
      shadow.appendChild(getBadgeTemplate().content.cloneNode(true))
      el.appendChild(badge)
    }

    const numSpan = badge.shadowRoot?.querySelector('.badge-num')
    const countText = `${count}`
    if (numSpan && numSpan.textContent !== countText) {
      numSpan.textContent = countText
    }
  }

  const compensateEntryTranslate = (
    targetItem: ActiveLeaderItem,
    nodeState: DanmakuNodeState,
    scale: number,
  ) => {
    const entryCompensateWindowMs = Math.round(targetItem.durationMs * 0.12)
    if (
      Date.now() - targetItem.birthTime >= entryCompensateWindowMs ||
      nodeState.translateCompensated
    ) {
      return
    }
    const { el } = targetItem
    const inlineTranslate = el.style.getPropertyValue('--translateX')
    if (!inlineTranslate || !inlineTranslate.includes('px')) {
      return
    }
    const originalPx = parseFloat(inlineTranslate)
    if (originalPx >= 0) {
      return
    }
    nodeState.originalTranslateX = inlineTranslate
    nodeState.translateCompensated = true
    const textLen = estimateDisplayLength(targetItem.rawText || '')
    const extraPx = Math.round(textLen * targetItem.baseFontSize * (scale - 1) * 0.75) + 60
    const nextTranslateX = `${originalPx - extraPx}px`
    nodeState.appliedTranslateX = nextTranslateX
    el.style.setProperty('--translateX', nextTranslateX)
  }

  const inflate = (targetItem: ActiveLeaderItem, nodeState: DanmakuNodeState): void => {
    const { el } = targetItem
    if (!el || !el.isConnected) {
      return
    }
    ensureBadge(el, targetItem.count)

    const options = getOptions()
    const scalePercent = Math.min(
      options.maxScale,
      100 + (targetItem.count - 1) * options.scaleStep,
    )
    const scale = scalePercent / 100
    const newFontSize = `${Math.round(targetItem.baseFontSize * scale)}px`
    syncInflatedImages(el)
    el.classList.add(INFLATED_CLASS)
    el.style.fontSize = newFontSize
    el.style.setProperty('--fontSize', newFontSize)
    el.style.setProperty(DM_SCALE_VAR, String(scale))
    nodeState.appliedFontSize = el.style.fontSize
    nodeState.appliedCssVarFontSize = el.style.getPropertyValue('--fontSize')

    compensateEntryTranslate(targetItem, nodeState, scale)
  }

  const inheritSelfBorder = (
    el: HTMLElement,
    leaderState: DanmakuNodeState,
    borderColor: string,
  ): void => {
    if (!el || !el.isConnected || leaderState.hasSelfBorder) {
      return
    }
    leaderState.hasSelfBorder = true
    if (extractSelfBorderColor(el)) {
      return
    }
    leaderState.selfBorderInherited = true
    el.style.setProperty(SELF_BORDER_COLOR_VAR, borderColor)
    el.classList.add(SELF_MERGED_CLASS)
  }

  return {
    resolveBaseFontSize,
    resolveDurationMs,
    ensureBadge,
    inflate,
    inheritSelfBorder,
  }
}

export type DanmakuRenderer = ReturnType<typeof createDanmakuRenderer>

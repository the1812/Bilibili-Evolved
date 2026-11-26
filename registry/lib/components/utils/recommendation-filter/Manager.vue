<template>
  <VPopup
    ref="popup"
    v-model="open"
    fixed
    :auto-close="false"
    :esc-close="false"
    class="be-recommendation-filter-manager"
    role="dialog"
    aria-label="推荐过滤设置"
    :aria-hidden="!open"
    :inert="open ? null : ''"
  >
    <template v-if="open">
      <header class="rf-manager-header" title="拖动此处移动窗口" @pointerdown="startDrag">
        <div>
          <h2>推荐过滤设置</h2>
        </div>
        <button
          type="button"
          class="rf-close"
          aria-label="关闭推荐过滤设置"
          @pointerdown.stop
          @click="close"
        >
          <VIcon icon="close" :size="22" />
        </button>
      </header>
      <nav class="rf-tabs" role="tablist" aria-label="设置分类">
        <button
          id="rf-keywords-tab"
          type="button"
          role="tab"
          :aria-selected="tab === 'keywords'"
          aria-controls="rf-keywords-panel"
          @click="tab = 'keywords'"
        >
          关键词组
        </button>
        <button
          id="rf-options-tab"
          type="button"
          role="tab"
          :aria-selected="tab === 'options'"
          aria-controls="rf-options-panel"
          @click="tab = 'options'"
        >
          其他规则
        </button>
        <button
          id="rf-settings-tab"
          type="button"
          role="tab"
          :aria-selected="tab === 'settings'"
          aria-controls="rf-settings-panel"
          @click="tab = 'settings'"
        >
          设置
        </button>
      </nav>
      <KeywordManager
        v-show="tab === 'keywords'"
        id="rf-keywords-panel"
        ref="keywords"
        role="tabpanel"
        aria-labelledby="rf-keywords-tab"
      />
      <div
        v-show="tab === 'options'"
        id="rf-options-panel"
        class="rf-options-panel"
        role="tabpanel"
        aria-labelledby="rf-options-tab"
      >
        <Settings page="rules" />
      </div>
      <div
        v-show="tab === 'settings'"
        id="rf-settings-panel"
        class="rf-options-panel"
        role="tabpanel"
        aria-labelledby="rf-settings-tab"
      >
        <Settings page="settings" @reset-window="resetWindow" />
      </div>
      <footer class="rf-manager-footer">
        已检查 {{ state.scanned }} · 已过滤 {{ state.matched }}
      </footer>
    </template>
  </VPopup>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { VPopup, VIcon } from '@/ui'
import { addComponentListener, removeComponentListener } from '@/core/settings'
import KeywordManager from './KeywordManager.vue'
import Settings from './Settings.vue'
import { getOptions, uiState } from './runtime'
import { componentName } from './options'

let position:
  | {
      x: number
      y: number
    }
  | undefined

let drag:
  | {
      id: number
      pointerX: number
      pointerY: number
      startX: number
      startY: number
      x: number
      y: number
      maxX: number
      maxY: number
      handle: HTMLElement
    }
  | undefined

let dragFrame: number | undefined

const clamp = (value: number, max: number) => Math.max(8, Math.min(value, Math.max(8, max)))

const setPosition = (element: HTMLElement, x: number, y: number) => {
  position = {
    x,
    y,
  }
  element.style.setProperty('--rf-x', `${x}px`)
  element.style.setProperty('--rf-y', `${y}px`)
}

/* eslint-disable @typescript-eslint/no-use-before-define */

const popup = ref<Vue>()
const keywords = ref<Vue & { flush: () => void; beginCardImport: (title: string) => void }>()

const open = ref(false)

const tab = ref('keywords')

const state = uiState

function importTitle(title: string) {
  tab.value = 'keywords'
  keywords.value.beginCardImport(title)
}

function updateLayout() {
  endDrag()
  const options = getOptions()
  const width = Math.min(options.windowWidth, innerWidth - 16)
  const height = Math.min(options.windowHeight, innerHeight - 16)
  const element = popup.value.$el as HTMLElement
  element.style.setProperty('--rf-width', `${width}px`)
  element.style.setProperty('--rf-height', `${height}px`)
  setPosition(
    element,
    clamp(position?.x ?? (innerWidth - width) / 2, innerWidth - width - 8),
    clamp(position?.y ?? innerHeight * 0.05, innerHeight - height - 8),
  )
}

function resetWindow() {
  position = undefined
  updateLayout()
}

function startDrag(event: PointerEvent) {
  if (event.button !== 0 || (event.target instanceof Element && event.target.closest('button'))) {
    return
  }
  endDrag()
  event.preventDefault()
  const rect = popup.value.$el.getBoundingClientRect()
  const handle = event.currentTarget as HTMLElement
  drag = {
    id: event.pointerId,
    pointerX: event.clientX,
    pointerY: event.clientY,
    startX: rect.left,
    startY: rect.top,
    x: rect.left,
    y: rect.top,
    maxX: innerWidth - rect.width - 8,
    maxY: innerHeight - rect.height - 8,
    handle,
  }
  if (event.isTrusted) {
    handle.setPointerCapture(event.pointerId)
  }
  popup.value.$el.classList.add('rf-dragging')
  window.addEventListener('pointermove', moveDrag, {
    passive: true,
  })
  window.addEventListener('pointerup', endDrag)
  window.addEventListener('pointercancel', endDrag)
  window.addEventListener('blur', endDrag)
}

function moveDrag(event: PointerEvent) {
  if (!drag || event.pointerId !== drag.id) {
    return
  }
  drag.x = clamp(drag.startX + event.clientX - drag.pointerX, drag.maxX)
  drag.y = clamp(drag.startY + event.clientY - drag.pointerY, drag.maxY)
  if (dragFrame === undefined) {
    dragFrame = requestAnimationFrame(() => {
      dragFrame = undefined
      if (drag) {
        setPosition(popup.value.$el as HTMLElement, drag.x, drag.y)
      }
    })
  }
}

function endDrag() {
  if (dragFrame !== undefined) {
    cancelAnimationFrame(dragFrame)
    dragFrame = undefined
  }
  if (drag) {
    setPosition(popup.value.$el as HTMLElement, drag.x, drag.y)
    if (drag.handle.hasPointerCapture(drag.id)) {
      drag.handle.releasePointerCapture(drag.id)
    }
    drag = undefined
  }
  popup.value.$el.classList.remove('rf-dragging')
  window.removeEventListener('pointermove', moveDrag)
  window.removeEventListener('pointerup', endDrag)
  window.removeEventListener('pointercancel', endDrag)
  window.removeEventListener('blur', endDrag)
}

function close() {
  endDrag()
  keywords.value?.flush()
  open.value = false
}

watch(open, (value: boolean) => {
  if (value) {
    updateLayout()
  }
})

onMounted(() => {
  updateLayout()
  window.addEventListener('resize', updateLayout)
  addComponentListener(`${componentName}.windowWidth`, updateLayout)
  addComponentListener(`${componentName}.windowHeight`, updateLayout)
})

onBeforeUnmount(() => {
  endDrag()
  window.removeEventListener('resize', updateLayout)
  removeComponentListener(`${componentName}.windowWidth`, updateLayout)
  removeComponentListener(`${componentName}.windowHeight`, updateLayout)
  position = undefined
})

defineExpose({ open, close, importTitle })
</script>

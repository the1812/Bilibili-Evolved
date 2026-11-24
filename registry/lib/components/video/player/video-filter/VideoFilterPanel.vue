<template>
  <div
    id="be-video-filter-presets"
    ref="panel"
    class="be-video-filter-menu-presets"
    popover="manual"
    role="dialog"
    aria-labelledby="be-video-filter-title"
    @click.stop
  >
    <div class="be-video-filter-header">
      <strong id="be-video-filter-title">视频滤镜</strong>
      <button type="button" class="be-video-filter-dismiss" aria-label="关闭面板" @click="close">
        <VIcon icon="mdi-close" :size="18" />
      </button>
    </div>
    <div class="be-video-filter-choices">
      <button
        v-for="choice in choices"
        :key="String(choice)"
        type="button"
        :aria-pressed="state.selection === choice ? 'true' : 'false'"
        :disabled="!state.available"
        @click="emit('select', choice)"
      >
        {{ choice || '关闭滤镜' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'
import { playerAgent } from '@/components/video/player-agent'
import { sizeChange } from '@/core/observer'
import { VIcon } from '@/ui'

const props = defineProps<{
  trigger: HTMLElement
  modes: string[]
  state: { selection: string | false; available: boolean }
}>()
const emit = defineEmits<{ (event: 'select', choice: string | false): void }>()
const choices = [false as const, ...props.modes]
const panel = ref<HTMLElement>()
const listeners = new AbortController()
let openListeners: AbortController | undefined

const close = () => {
  openListeners?.abort()
  openListeners = undefined
  panel.value?.hidePopover()
  props.trigger.setAttribute('aria-expanded', 'false')
}

const toggle = () => {
  if (openListeners) {
    close()
    return
  }
  const element = panel.value
  const area = playerAgent.query.video.wrap.sync()
  if (!element || !area || !props.state.available) {
    return
  }
  const position = () => {
    const { left, top, width, height } = area.getBoundingClientRect()
    element.style.left = `${left + width / 2}px`
    element.style.top = `${top + height / 2}px`
    element.style.maxWidth = `${Math.max(0, width - 16)}px`
  }
  position()
  element.showPopover()
  props.trigger.setAttribute('aria-expanded', 'true')
  element.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus({ preventScroll: true })
  openListeners = new AbortController()
  const { signal } = openListeners
  const [observer] = sizeChange(area, position)
  signal.addEventListener('abort', () => observer.disconnect(), { once: true })
  window.addEventListener('resize', position, { signal })
  window.addEventListener('scroll', position, { capture: true, signal })
  document.addEventListener(
    'click',
    event => {
      const target = event.target as Node
      if (!element.contains(target) && !props.trigger.contains(target)) {
        close()
      }
    },
    { capture: true, signal },
  )
  document.addEventListener(
    'keydown',
    event => {
      if (event.key === 'Escape') {
        close()
        props.trigger.focus()
      }
    },
    { signal },
  )
}

watchEffect(() => props.trigger.setAttribute('aria-disabled', String(!props.state.available)))
onMounted(() => props.trigger.addEventListener('click', toggle, { signal: listeners.signal }))
onBeforeUnmount(() => {
  listeners.abort()
  close()
})
</script>

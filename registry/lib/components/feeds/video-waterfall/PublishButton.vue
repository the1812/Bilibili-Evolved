<template>
  <div
    class="bili-dyn-sidebar__btn be-feeds-video-waterfall-publish"
    :class="{ active: open }"
    :title="open ? '收起' : '写动态'"
    @click="toggle"
  >
    <VIcon :icon="open ? 'mdi-close' : 'mdi-pencil-outline'" :size="20" />
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { VIcon } from '@/ui'
import { publishingOpenClass } from './constants'

const open = ref(false)

const toggle = () => {
  open.value = !open.value
  document.documentElement.classList.toggle(publishingOpenClass, open.value)
  if (open.value) {
    ;(dq('.bili-dyn-publishing .bili-rich-textarea__inner') as HTMLElement | null)?.focus()
  }
}

onBeforeUnmount(() => {
  document.documentElement.classList.remove(publishingOpenClass)
})
</script>

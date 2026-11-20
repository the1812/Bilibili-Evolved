<template>
  <dialog
    ref="dialog"
    class="dashboard-home-link-preview"
    :class="{ 'is-reading-preview': preview?.type === 'dynamic' || preview?.type === 'column' }"
    aria-labelledby="dashboard-home-link-preview-title"
    closedby="any"
    @close="clearPreview"
  >
    <div class="dashboard-home-link-preview-layout">
      <header class="dashboard-home-link-preview-header">
        <h2 id="dashboard-home-link-preview-title" :title="previewTitle">
          {{ previewTitle }}
        </h2>
        <form method="dialog" class="dashboard-home-link-preview-actions">
          <a v-if="currentUrl" :href="currentUrl.href" target="_blank" rel="noopener">
            在新标签页打开
          </a>
          <button type="submit" aria-label="关闭预览" title="关闭预览" autofocus>
            <VIcon icon="mdi-close" :size="18" aria-hidden="true" />
          </button>
        </form>
      </header>
      <iframe
        v-if="requestedUrl"
        :key="requestedUrl.href"
        ref="frame"
        :src="requestedUrl.href"
        :title="previewTitle"
        allowfullscreen
        @load="updatePage"
      />
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue'
import { VIcon } from '@/ui'
import { formatLink, isHttp, type LinkType } from './urls'

const dialog = ref<HTMLDialogElement>()
const frame = ref<HTMLIFrameElement>()
const preview = shallowRef<{ url: URL; type: LinkType }>()
const loadedUrl = shallowRef<URL>()
const requestedUrl = computed(() => preview.value?.url)
const currentUrl = computed(() => loadedUrl.value ?? requestedUrl.value)
const previewTitle = computed(() => (currentUrl.value ? formatLink(currentUrl.value) : '链接预览'))

const updatePage = () => {
  const href = frame.value?.contentDocument?.URL
  if (!dialog.value?.open || !href) {
    loadedUrl.value = undefined
    return
  }
  if (loadedUrl.value?.href === href) {
    return
  }
  const url = new URL(href)
  loadedUrl.value = isHttp(url) ? url : undefined
}

watch(frame, (element, _, onCleanup) => {
  if (!element) {
    return
  }
  // Same-document navigations can change the URL without firing load.
  const timer = window.setInterval(updatePage, 1000)
  onCleanup(() => window.clearInterval(timer))
})

const show = (nextUrl: URL, type: LinkType) => {
  const element = dialog.value
  if (!element?.showModal) {
    return false
  }
  loadedUrl.value = undefined
  preview.value = { url: nextUrl, type }
  if (!element.open) {
    element.showModal()
  }
  return true
}
const clearPreview = () => {
  if (!dialog.value?.open) {
    preview.value = undefined
    loadedUrl.value = undefined
  }
}

defineExpose({ show })
</script>

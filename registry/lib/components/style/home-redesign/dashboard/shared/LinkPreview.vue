<template>
  <dialog
    ref="dialogElement"
    class="dashboard-home-link-preview"
    :class="{
      'is-reading-preview': requestedPage?.type === 'dynamic' || requestedPage?.type === 'column',
    }"
    aria-labelledby="dashboard-home-link-preview-title"
    closedby="any"
    @close="clearPreview"
  >
    <header class="dashboard-home-link-preview-header">
      <h2 id="dashboard-home-link-preview-title" :title="previewTitle">
        {{ previewTitle }}
      </h2>
      <form method="dialog" class="dashboard-home-link-preview-actions">
        <a v-if="previewUrl" :href="previewUrl.href" target="_blank" rel="noopener">
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
      ref="iframeElement"
      :src="requestedUrl.href"
      :title="previewTitle"
      allowfullscreen
      @load="updatePreviewUrl"
    />
  </dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import { VIcon } from '@/ui'
import { formatLink, isHttp, type LinkType } from './urls'

const dialogElement = ref<HTMLDialogElement>()
const iframeElement = ref<HTMLIFrameElement>()
const requestedPage = shallowRef<{ url: URL; type: LinkType }>()
const iframeUrl = shallowRef<URL>()
const requestedUrl = computed(() => requestedPage.value?.url)
const previewUrl = computed(() => iframeUrl.value ?? requestedUrl.value)
const previewTitle = computed(() => (previewUrl.value ? formatLink(previewUrl.value) : '链接预览'))

const updatePreviewUrl = () => {
  const href = iframeElement.value?.contentDocument?.URL
  if (!dialogElement.value?.open || !href) {
    iframeUrl.value = undefined
    return
  }
  if (iframeUrl.value?.href === href) {
    return
  }
  const url = new URL(href)
  iframeUrl.value = isHttp(url) ? url : undefined
}

const openPreview = (url: URL, type: LinkType) => {
  const element = dialogElement.value
  if (!element?.showModal) {
    return false
  }
  iframeUrl.value = undefined
  requestedPage.value = { url, type }
  nextTick(() => {
    // Render the accessible title and preview controls before the browser moves focus.
    if (element.isConnected && !element.open) {
      element.showModal()
    }
  })
  return true
}

const clearPreview = () => {
  if (!dialogElement.value?.open) {
    requestedPage.value = undefined
    iframeUrl.value = undefined
  }
}

watch(iframeElement, (element, _, onCleanup) => {
  if (!element) {
    return
  }
  // Same-document navigations can change the URL without firing load.
  const timer = window.setInterval(updatePreviewUrl, 1000)
  onCleanup(() => window.clearInterval(timer))
})

defineExpose({ openPreview })
</script>

<template>
  <dialog
    ref="dialogElement"
    class="dashboard-home-link-preview"
    :class="{ 'is-docked': isDocked }"
    :style="dockStyle"
    aria-labelledby="dashboard-home-link-preview-title"
    :closedby="isDocked ? 'closerequest' : 'any'"
    @close="clearPreview"
  >
    <header ref="headerElement" class="dashboard-home-link-preview-header">
      <h2 id="dashboard-home-link-preview-title" :title="previewTitle">
        {{ previewTitle }}
      </h2>
      <form method="dialog" class="dashboard-home-link-preview-actions">
        <a v-if="previewUrl" :href="previewUrl.href" target="_blank" rel="noopener">
          在新标签页打开
        </a>
        <button
          ref="dockButton"
          type="button"
          :aria-label="dockButtonLabel"
          :title="dockButtonLabel"
          @click="toggleDocked"
        >
          <VIcon
            :icon="isDocked ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            :size="18"
            aria-hidden="true"
          />
        </button>
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
      :inert="isDocked ? '' : null"
      allowfullscreen
      @load="updatePreviewUrl"
    />
  </dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import { VIcon } from '@/ui'
import { formatLink, isHttp } from '../shared/urls'

const previewUrlPollIntervalMs = 1000

const dialogElement = ref<HTMLDialogElement>()
const headerElement = ref<HTMLElement>()
const dockButton = ref<HTMLButtonElement>()
const iframeElement = ref<HTMLIFrameElement>()
const isDocked = ref(false)
const dockHeaderBlockSize = ref<number>()
const requestedUrl = shallowRef<URL>()
const iframeUrl = shallowRef<URL>()

const dockButtonLabel = computed(() => (isDocked.value ? '还原预览' : '收起预览'))
const dockStyle = computed(() =>
  dockHeaderBlockSize.value === undefined
    ? undefined
    : { '--dashboard-home-link-preview-header-block-size': `${dockHeaderBlockSize.value}px` },
)
const previewUrl = computed(() => iframeUrl.value ?? requestedUrl.value)
const previewTitle = computed(() => (previewUrl.value ? formatLink(previewUrl.value) : '链接预览'))

const updatePreviewUrl = () => {
  if (!dialogElement.value?.open) {
    return
  }
  const href = iframeElement.value?.contentDocument?.URL
  if (!href) {
    iframeUrl.value = undefined
    return
  }
  if (iframeUrl.value?.href === href) {
    return
  }
  const url = new URL(href)
  iframeUrl.value = isHttp(url) ? url : undefined
}

const setDocked = (element: HTMLDialogElement, docked: boolean) => {
  if (!element.open || isDocked.value === docked) {
    return
  }
  isDocked.value = docked
  // Reopen in the other native mode without removing the iframe.
  element.close()
  if (docked) {
    element.show()
  } else {
    element.showModal()
  }
}

const toggleDocked = () => {
  const element = dialogElement.value
  if (!element?.open) {
    return
  }
  if (!isDocked.value) {
    dockHeaderBlockSize.value = headerElement.value?.offsetHeight
  }
  setDocked(element, !isDocked.value)
  dockButton.value?.focus({ preventScroll: true })
}

const openPreview = (url: URL) => {
  const element = dialogElement.value
  if (!element?.showModal) {
    return false
  }
  iframeUrl.value = undefined
  requestedUrl.value = url
  nextTick(() => {
    // Render the accessible title and preview controls before the browser moves focus.
    if (!element.isConnected) {
      return
    }
    if (element.open) {
      setDocked(element, false)
    } else {
      isDocked.value = false
      element.showModal()
    }
  })
  return true
}

const clearPreview = async () => {
  const element = dialogElement.value
  const url = requestedUrl.value
  if (!element || element.open || !url) {
    return
  }
  // Preserve the visible preview until its exit transition completes.
  await Promise.allSettled(element.getAnimations().map(animation => animation.finished))
  if (!element.open && requestedUrl.value === url) {
    isDocked.value = false
    dockHeaderBlockSize.value = undefined
    requestedUrl.value = undefined
    iframeUrl.value = undefined
  }
}

watch(iframeElement, (element, _, onCleanup) => {
  if (!element) {
    return
  }
  // Same-document navigations can change the URL without firing load.
  const timer = window.setInterval(updatePreviewUrl, previewUrlPollIntervalMs)
  onCleanup(() => window.clearInterval(timer))
})

defineExpose({ openPreview })
</script>

<template>
  <dialog
    ref="dialog"
    class="dashboard-home-link-preview"
    :class="{ 'is-reading-preview': preview?.reading }"
    aria-labelledby="dashboard-home-link-preview-title"
    closedby="any"
    @close="clearUrl"
  >
    <div class="dashboard-home-link-preview-layout">
      <header class="dashboard-home-link-preview-header">
        <h2 id="dashboard-home-link-preview-title" :title="url?.hostname">
          {{ url?.hostname ?? '链接预览' }}
        </h2>
        <form method="dialog" class="dashboard-home-link-preview-actions">
          <a v-if="url" :href="url.href" target="_blank" rel="noopener">在新标签页打开</a>
          <button type="submit" aria-label="关闭预览" title="关闭预览" autofocus>
            <VIcon icon="mdi-close" :size="18" aria-hidden="true" />
          </button>
        </form>
      </header>
      <iframe
        v-if="url"
        :src="url.href"
        :title="`链接预览 · ${url.hostname}`"
        :sandbox="url.origin === pageOrigin ? undefined : previewSandbox"
        allowfullscreen
      />
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { VIcon } from '@/ui'

const dialog = ref<HTMLDialogElement>()
const preview = shallowRef<{ url: URL; reading: boolean }>()
const url = computed(() => preview.value?.url)
const pageOrigin = location.origin
const previewSandbox =
  'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation'

const show = (nextUrl: URL, reading: boolean) => {
  const element = dialog.value
  if (!element?.showModal) {
    return false
  }
  preview.value = { url: nextUrl, reading }
  if (!element.open) {
    element.showModal()
  }
  return true
}
const clearUrl = () => {
  if (!dialog.value?.open) {
    preview.value = undefined
  }
}

defineExpose({ show })
</script>

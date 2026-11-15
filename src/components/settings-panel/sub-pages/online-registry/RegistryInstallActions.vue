<template>
  <div class="online-registry-install-actions">
    <VButton ref="linksButton" :disabled="installing" @click="toggleLinks">
      <VIcon icon="mdi-link-plus" :size="16" />
      链接添加
    </VButton>
    <VButton :disabled="installing" @click="browse">
      <VIcon icon="mdi-folder-open-outline" :size="16" />
      本地浏览
    </VButton>
    <VPopup
      v-model="linksOpen"
      :trigger-element="linksButton"
      class="online-registry-add-popup"
      esc-close
    >
      <TextArea
        ref="linksInput"
        v-model="input"
        :disabled="installing"
        placeholder="粘贴功能链接，每行一个"
      />
      <div class="online-registry-add-actions">
        <VButton @click="linksOpen = false">取消</VButton>
        <VButton type="primary" :disabled="installing || !urls.length" @click="installLinks">
          <VIcon icon="mdi-plus" :size="16" />
          添加
        </VButton>
      </div>
    </VPopup>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { pickFile } from '@/core/file-picker'
import { installFeature, installFeatureFromCode, readFeatureZip } from '@/core/install-feature'
import { Toast, ToastType } from '@/core/toast'
import { logError } from '@/core/utils/log'
import { TextArea, VButton, VIcon, VPopup } from '@/ui'

const props = defineProps<{ open: boolean }>()
const linksOpen = ref(false)
const linksButton = ref<InstanceType<typeof VButton>>()
const linksInput = ref<{ focus(): void }>()
const input = ref('')
const urls = computed(() =>
  input.value
    .split('\n')
    .map(url => url.trim())
    .filter(Boolean),
)
const installing = ref(false)

const toggleLinks = async () => {
  linksOpen.value = !linksOpen.value
  if (linksOpen.value) {
    await nextTick()
    linksInput.value?.focus()
  }
}

watch(
  () => props.open,
  open => {
    if (!open) {
      linksOpen.value = false
    }
  },
)

const installLinks = async () => {
  const sources = urls.value
  const total = sources.length
  if (installing.value || total === 0) {
    return
  }
  installing.value = true
  const toast = Toast.info(`安装中... (0/${total})`, '批量添加')
  let completed = 0
  try {
    const results = await Promise.allSettled(
      sources.map(async url => {
        try {
          return await installFeature(url)
        } finally {
          completed++
          toast.message = `安装中... (${completed}/${total})`
        }
      }),
    )
    const failures = results.flatMap((result, index) =>
      result.status === 'rejected' ? [{ url: sources[index], reason: result.reason }] : [],
    )
    input.value = failures.map(({ url }) => url).join('\n')
    toast.message = [
      `安装完成，成功 ${total - failures.length} 个，失败 ${failures.length} 个。`,
      ...failures.map(({ url, reason }) => lodash.escape(`${url}: ${String(reason)}`)),
    ].join('\n')
    if (failures.length > 0) {
      toast.type = ToastType.Error
    }
  } finally {
    toast.duration = 5000
    installing.value = false
  }
}

const browse = async () => {
  if (installing.value) {
    return
  }
  const [file] = await pickFile({ accept: '.js,.zip' })
  if (!file || installing.value) {
    return
  }
  installing.value = true
  try {
    const code = await (file.name.toLowerCase().endsWith('.zip')
      ? readFeatureZip(file)
      : file.text())
    const { message } = await installFeatureFromCode(code, '')
    Toast.info(lodash.escape(message), '添加功能', 3000)
  } catch (error) {
    logError(error)
  } finally {
    installing.value = false
  }
}
</script>

<style lang="scss">
@import 'common';

.online-registry-install-actions {
  position: relative;
  @include h-center(8px);

  .be-button .be-icon {
    margin-right: 4px;
  }
}

.online-registry-add-popup {
  top: calc(100% + 8px);
  right: 0;
  z-index: 2;
  box-sizing: border-box;
  width: min(320px, calc(100vw - 48px));
  padding: 8px;
  transform: translateY(-8px);
  transition: 0.2s ease-out;
  @include popup();
  @include v-stretch(8px);
  &.open {
    transform: translateY(0);
  }
  textarea {
    min-height: 7lh;
    max-height: 35vh;
  }
  .online-registry-add-actions {
    @include h-stretch(8px);
    .be-button {
      flex: 1;
    }
  }
}
</style>

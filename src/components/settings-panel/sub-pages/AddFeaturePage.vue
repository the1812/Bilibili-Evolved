<template>
  <div class="add-feature-page">
    <TextArea
      v-model="input"
      :disabled="installing"
      rows="6"
      placeholder="粘贴功能链接，每行一个"
    />
    <div class="add-feature-actions">
      <VButton type="primary" :disabled="installing || !urls.length" @click="installLinks">
        <VIcon icon="mdi-download-multiple" :size="18" />
        批量添加
      </VButton>
      <VButton :disabled="installing" @click="browse">
        <VIcon icon="mdi-folder-open-outline" :size="18" />
        浏览本地文件
      </VButton>
      <OnlineRegistryButton>
        <VIcon icon="mdi-web" :size="18" />
        功能库
      </OnlineRegistryButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { pickFile } from '@/core/file-picker'
import { installFeature, installFeatureFromCode, readFeatureZip } from '@/core/install-feature'
import { Toast, ToastType } from '@/core/toast'
import { logError } from '@/core/utils/log'
import { TextArea, VButton, VIcon } from '@/ui'
import OnlineRegistryButton from './online-registry/OnlineRegistryButton.vue'

const input = ref('')
const urls = computed(() =>
  input.value
    .split('\n')
    .map(url => url.trim())
    .filter(Boolean),
)
const installing = ref(false)

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

.add-feature-page {
  @include v-stretch(12px);
  padding: 12px;

  .add-feature-actions {
    @include h-stretch(8px);
    flex-wrap: wrap;

    .be-button {
      flex: 1 0 auto;
      .be-icon {
        margin-right: 4px;
      }
    }
  }
}
</style>

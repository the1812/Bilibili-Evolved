<template>
  <div class="video-page-background-extra-options">
    <div class="row">
      <div class="row-label">背景图片 URL</div>
      <TextBox
        :text="urlInput"
        :change-on-blur="true"
        placeholder="https://..."
        @change="updateUrl"
      />
    </div>
    <div class="actions">
      <VButton @click="selectLocalImage">选择本地图片</VButton>
      <VButton :disabled="!hasImage" @click="clearImage">清除</VButton>
    </div>
    <div v-if="isLocalImage" class="status" :title="backgroundImage.name">
      已使用本地图片：{{ backgroundImage.name }}
    </div>
    <div v-if="hasImage" class="preview">
      <img
        v-show="!previewFailed"
        :src="backgroundImage.url"
        alt="背景图片预览"
        @load="previewFailed = false"
        @error="previewFailed = true"
      />
      <div v-if="previewFailed" class="preview-error">图片加载失败</div>
    </div>
    <div class="description">
      本地图片以 Base64 形式保存在组件设置中，大小不能超过 {{ localUploadLimit }} KiB。
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { pickFile } from '@/core/file-picker'
import { getComponentSettings } from '@/core/settings'
import { Toast } from '@/core/toast'
import { TextBox, VButton } from '@/ui'
import {
  BackgroundImage,
  emptyBackgroundImage,
  LOCAL_UPLOAD_LIMIT_KIB,
  Options,
} from './options'

const componentName = 'videoPageBackground'
const title = '播放页自定义背景'
const { options } = getComponentSettings<Options>(componentName)
const backgroundImage = computed(() => options.backgroundImage)
const isLocalImage = computed(() => backgroundImage.value.url.startsWith('data:image/'))
const hasImage = computed(() => Boolean(backgroundImage.value.url))
const urlInput = computed(() => (isLocalImage.value ? '' : backgroundImage.value.url))
const localUploadLimit = LOCAL_UPLOAD_LIMIT_KIB

const previewFailed = ref(false)
watch(
  () => backgroundImage.value.url,
  () => {
    previewFailed.value = false
  },
)

const updateUrl = (url: string) => {
  const trimmed = url.trim()
  if (!trimmed) {
    options.backgroundImage = emptyBackgroundImage()
    return
  }
  options.backgroundImage = { name: trimmed, url: trimmed }
}

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(String(reader.result)))
    reader.addEventListener('error', () => reject(reader.error))
    reader.readAsDataURL(file)
  })

const selectLocalImage = async () => {
  const [file] = await pickFile({ accept: 'image/*' })
  if (!file) {
    return
  }
  if (file.size > LOCAL_UPLOAD_LIMIT_KIB * 1024) {
    Toast.error(`图片不能超过 ${LOCAL_UPLOAD_LIMIT_KIB} KiB`, title, 3000)
    return
  }
  try {
    const image: BackgroundImage = {
      name: file.name,
      url: await readAsDataUrl(file),
    }
    options.backgroundImage = image
    Toast.success('本地图片已保存', title, 2000)
  } catch {
    Toast.error('读取本地图片失败', title, 3000)
  }
}

const clearImage = () => {
  options.backgroundImage = emptyBackgroundImage()
}
</script>

<style lang="scss">
@import 'common';

.video-page-background-extra-options {
  margin-top: 8px;
  @include v-stretch(8px);

  .description,
  .status {
    font-size: 12px;
    opacity: 0.75;
  }

  .status {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .row {
    @include v-stretch(4px);

    .row-label {
      font-size: 12px;
      opacity: 0.75;
    }
  }

  .actions {
    display: flex;
    @include h-stretch(8px);
  }

  .preview {
    display: flex;
    align-items: center;
    justify-content: center;
    max-height: 120px;
    padding: 4px;
    border: 1px solid #8884;
    border-radius: 4px;
    background-color: #8881;
    overflow: hidden;

    img {
      max-width: 100%;
      max-height: 112px;
      object-fit: contain;
      border-radius: 2px;
    }

    .preview-error {
      font-size: 12px;
      opacity: 0.75;
      padding: 12px 0;
    }
  }
}
</style>

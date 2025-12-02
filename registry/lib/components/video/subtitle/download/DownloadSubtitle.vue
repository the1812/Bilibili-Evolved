<template>
  <div v-if="folded">
    <DefaultWidget name="下载字幕" icon="mdi-subtitles" @click="folded = false"></DefaultWidget>
  </div>
  <div v-else class="subtitle-download">
    <div class="subtitle-download-header">
      <div class="subtitle-download-title">
        <VIcon :size="24" icon="mdi-subtitles" />
        <span>下载字幕</span>
      </div>
      <VButton round icon type="transparent" @click="folded = true">
        <VIcon :size="18" icon="mdi-close" />
      </VButton>
    </div>
    <div v-if="subtitleLanguageOptions.length > 0" class="subtitle-download-language">
      <div class="">语言:</div>
      <VDropdown v-model="selectedLanguage" :items="subtitleLanguageOptions" :disabled="disabled" />
    </div>
    <div class="subtitle-download-formats">
      <DefaultWidget
        :disabled="disabled"
        name="下载 JSON"
        icon="mdi-download"
        @click="download('json')"
      ></DefaultWidget>
      <DefaultWidget
        :disabled="disabled"
        name="下载 ASS"
        icon="mdi-download"
        @click="download('ass')"
      ></DefaultWidget>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DefaultWidget, VButton, VDropdown, VIcon } from '@/ui'
import { logError } from '@/core/utils/log'
import { getFriendlyTitle } from '@/core/utils/title'
import { DownloadPackage } from '@/core/download'
import { WithName } from '@/core/common-types'
import { SubtitleDownloadType, getSubtitleBlob, getSubtitleConfig, getSubtitleList } from './utils'
import { ascendingBigIntSort } from '@/core/utils/sort'

type LanguageOption = WithName

const folded = ref(true)
const disabled = ref(false)
const subtitleLanguageOptions = ref<LanguageOption[]>([])
const selectedLanguage = ref<LanguageOption | undefined>(undefined)

const getSubtitleLanguageOptions = async () => {
  const subtitles = await getSubtitleList(unsafeWindow.aid, unsafeWindow.cid)
  return subtitles.toSorted(ascendingBigIntSort(it => it.id_str)).map(subtitle => {
    const displayName = subtitle.ai_status !== 0 ? `${subtitle.lan_doc} (AI)` : subtitle.lan_doc
    return {
      displayName,
      name: subtitle.lan,
    }
  })
}

Promise.all([getSubtitleLanguageOptions(), getSubtitleConfig()]).then(([options, [, language]]) => {
  subtitleLanguageOptions.value = options
  const matchOption = options.find(option => option.name === language)
  if (matchOption !== undefined) {
    selectedLanguage.value = matchOption
  }
})

const download = async (type: SubtitleDownloadType) => {
  try {
    disabled.value = true
    const blob = await getSubtitleBlob(type, { language: selectedLanguage.value?.name })
    DownloadPackage.single(`${getFriendlyTitle(true)}.${type}`, blob)
  } catch (error) {
    logError(error)
  } finally {
    disabled.value = false
  }
}
</script>
<style lang="scss">
@import 'common';

.subtitle-download {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 6px;
  border-radius: 4px;
  padding: 8px;
  box-sizing: border-box;
  box-shadow: 0 0 0 1px #8884;
  @include default-background-color();
  &-header {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    align-self: stretch;
  }
  &-title {
    @include h-center(8px);
    .be-icon {
      opacity: 0.75;
    }
  }
  &-language {
    @include h-center(6px);
  }
  &-formats {
    @include h-center(6px);
    flex-wrap: wrap;
  }
}
</style>

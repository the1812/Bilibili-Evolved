<template>
  <VPopup v-model:open="open" fixed class="download-video-panel" :trigger-element="triggerElement">
    <div class="download-video-panel-header">
      <VIcon icon="mdi-download" />
      <div class="title">下载视频</div>
      <VButton type="transparent" title="关闭" @click="open = false">
        <VIcon icon="mdi-close" :size="20" />
      </VButton>
    </div>
    <div class="download-video-panel-content">
      <div v-if="selectedInput" class="download-video-config-item">
        <div class="download-video-config-title">输入源:</div>
        <VDropdown v-model:value="selectedInput" :items="inputs" />
      </div>
      <div v-if="inputs.length === 0" class="download-video-config-item error">
        没有匹配的输入源, 请确保安装了适合此页面的插件.
      </div>
      <component
        :is="selectedInput.component"
        v-if="selectedInput && selectedInput.component"
        ref="inputOptions"
      />
      <div v-if="selectedApi" class="download-video-config-item">
        <div class="download-video-config-title">格式:</div>
        <VDropdown v-model:value="selectedApi" :items="apis" />
      </div>
      <div
        v-if="selectedApi && selectedApi.description"
        class="download-video-config-description"
        v-html="selectedApi.description"
      ></div>
      <div v-if="selectedQuality" class="download-video-config-item">
        <div class="download-video-config-title">清晰度:</div>
        <VDropdown
          v-model:value="selectedQuality"
          :items="filteredQualities"
          @update:value="saveSelectedQuality()"
        />
      </div>
      <template v-if="!testData.multiple && selectedQuality">
        <div v-if="testData.videoInfo" class="download-video-config-description">
          预计大小: {{ formatFileSize(testData.videoInfo.totalSize) }}
        </div>
        <div v-if="testData.videoInfo === null" class="download-video-config-description">
          正在计算大小
        </div>
      </template>
      <div class="download-video-config-item">
        <div class="download-video-config-title">使用备用下载地址:</div>
        <SwitchBox v-model:checked="useBackupUrls" />
      </div>
      <div class="download-video-config-description">
        若默认下载地址速度缓慢, 可以尝试更换备用下载地址.
      </div>
      <component
        :is="a.component"
        v-for="a of assetsWithOptions"
        :key="a.name"
        ref="assetsOptions"
        :name="a.name"
      />
      <div v-if="selectedOutput" class="download-video-config-item">
        <div class="download-video-config-title">输出方式:</div>
        <VDropdown v-model:value="selectedOutput" :items="outputs" />
      </div>
      <div
        v-if="selectedOutput && selectedOutput.description"
        class="download-video-config-description"
        v-html="selectedOutput.description"
      ></div>
      <component
        :is="selectedOutput.component"
        v-if="selectedOutput && selectedOutput.component"
        ref="outputOptions"
      />
    </div>
    <div class="download-video-panel-footer">
      <VButton
        class="run-download"
        type="primary"
        :disabled="!canStartDownload"
        @click="startDownload()"
      >
        开始
      </VButton>
    </div>
  </VPopup>
</template>
<script lang="ts" setup>
import type { Ref, ComponentPublicInstance } from 'vue'
import { ref, reactive, computed, watch, onMounted, useTemplateRef } from 'vue'
import type { VideoQuality } from '@/components/video/video-quality'
import { allQualities } from '@/components/video/video-quality'
import type { TestPattern } from '@/core/common-types'
import { getComponentSettings } from '@/core/settings'
import { Toast } from '@/core/toast'
import { matchUrlPattern } from '@/core/utils'
import { formatFileSize } from '@/core/utils/formatters'
import { logError } from '@/core/utils/log'
import { getFriendlyTitle } from '@/core/utils/title'
import { registerAndGetData } from '@/plugins/data'
import { SwitchBox, VButton, VDropdown, VIcon, VPopup } from '@/ui'

import { videoAudioDash, videoDashAv1, videoDashAvc, videoDashHevc } from './apis/dash'
import { videoFlv } from './apis/flv'
import { bangumiBatchInput } from './inputs/bangumi/batch'
import { videoBatchInput, videoSeasonBatchInput } from './inputs/video/batch'
import { videoSingleInput } from './inputs/video/input'
import { streamSaverOutput } from './outputs/stream-saver'
import type {
  DownloadVideoApi,
  DownloadVideoAssets,
  DownloadVideoInput,
  DownloadVideoInputItem,
  DownloadVideoOutput,
} from './types'
import { DownloadVideoAction } from './types'

const [inputsRaw] = registerAndGetData('downloadVideo.inputs', [
  videoSingleInput,
  videoBatchInput,
  videoSeasonBatchInput,
  bangumiBatchInput,
] as DownloadVideoInput[])
const [apisRaw] = registerAndGetData('downloadVideo.apis', [
  videoFlv,
  videoDashAvc,
  videoDashHevc,
  videoDashAv1,
  videoAudioDash,
] as DownloadVideoApi[])
const [assets] = registerAndGetData('downloadVideo.assets', [] as DownloadVideoAssets[])
const [outputsRaw] = registerAndGetData('downloadVideo.outputs', [
  streamSaverOutput,
] as DownloadVideoOutput[])
const { basicConfig } = getComponentSettings('downloadVideo').options as {
  basicConfig: {
    api: string
    quality: number
    output: string
    useBackupUrls: boolean
  }
}
const filterData = <T extends { match?: TestPattern }>(items: T[]) => {
  const matchedItems = items.filter(it => it.match?.some(p => matchUrlPattern(p)) ?? true)
  return matchedItems
}
const getFallbackTestVideoInfo = () =>
  ({
    aid: unsafeWindow.aid,
    cid: unsafeWindow.cid,
    title: getFriendlyTitle(true),
  } as DownloadVideoInputItem)

const inputOptions = useTemplateRef('inputOptions')
const assetsOptions = useTemplateRef<ComponentPublicInstance[]>('assetsOptions')
const outputOptions = useTemplateRef('outputOptions')

const { triggerElement } = defineProps<{ triggerElement: HTMLElement }>()

const open = ref(false)
const busy = ref(false)
const testData = reactive({
  // undefined: 无法获取; null: 获取中;
  videoInfo: null,
  // 是否有多P
  multiple: false,
})
const qualities = ref<VideoQuality[]>([])
const selectedQuality = ref<VideoQuality | undefined>(undefined)
const inputs = ref<DownloadVideoInput[]>([])
const selectedInput = ref<DownloadVideoInput | undefined>(undefined)
const apis = ref<DownloadVideoApi[]>([])
const selectedApi = ref<DownloadVideoApi | undefined>(undefined)
const outputs = ref<DownloadVideoOutput[]>(outputsRaw)
const selectedOutput = ref<DownloadVideoOutput>(
  outputsRaw.find(it => it.name === basicConfig.output) || outputsRaw[0],
)
const useBackupUrls = ref<boolean>(basicConfig.useBackupUrls || false)

const assetsWithOptions = computed(() => (assets as DownloadVideoAssets[]).filter(a => a.component))
const filteredQualities = computed(() =>
  qualities.value.length === 0 ? allQualities : qualities.value,
)
const canStartDownload = computed(() => {
  if (busy.value || !open.value) {
    return false
  }
  const isAnySelectionEmpty = [
    selectedQuality.value,
    selectedInput.value,
    selectedApi.value,
    selectedOutput.value,
  ].some(v => !v)
  if (isAnySelectionEmpty) {
    return false
  }
  return true
})

const updateTestVideoInfo = async () => {
  if (!selectedInput.value || !selectedApi.value) {
    return
  }
  testData.videoInfo = null
  const input = selectedInput.value as DownloadVideoInput
  const testItem = input.getTestInput?.() ?? getFallbackTestVideoInfo()
  console.log('[updateTestVideoInfo]', testItem)
  testData.multiple = input.batch
  const api = selectedApi.value as DownloadVideoApi
  try {
    const videoInfo = await api.downloadVideoInfo(testItem)
    qualities.value = videoInfo.qualities
    const isSelectedQualityOutdated =
      !selectedQuality.value ||
      !videoInfo.qualities.some(q => q.value === selectedQuality.value?.value)
    if (isSelectedQualityOutdated) {
      selectedQuality.value = videoInfo.qualities[0]
      if (basicConfig.quality) {
        const [matchedQuality] = videoInfo.qualities.filter(q => q.value <= basicConfig.quality)
        if (matchedQuality) {
          selectedQuality.value = matchedQuality
        }
      }
    }
    // 填充 quality 后要再请求一次得到对应 quality 的统计数据
    testItem.quality = selectedQuality.value
    const qualityVideoInfo = await api.downloadVideoInfo(testItem)
    testData.videoInfo = qualityVideoInfo
  } catch (error) {
    console.error('[updateTestVideoInfo] failed', error)
    testData.videoInfo = undefined
  }
}

watch(selectedInput, input => {
  if (input === undefined) {
    return
  }
  updateTestVideoInfo()
})
watch(selectedApi, api => {
  if (api === undefined) {
    return
  }
  updateTestVideoInfo()
  basicConfig.api = api.name
})
watch(selectedOutput, output => {
  if (output === undefined) {
    return
  }
  basicConfig.output = output.name
})
watch(useBackupUrls, val => {
  if (val === undefined) {
    return
  }
  basicConfig.useBackupUrls = val
})

// 只有手动选择的清晰度要记录, 因此不能直接 watch
const saveSelectedQuality = () => {
  const quality = selectedQuality.value
  if (quality === undefined) {
    return
  }
  basicConfig.quality = quality.value
  updateTestVideoInfo()
}

// const getVideoItems = async () => {
//   const input = selectedInput.value as DownloadVideoInput
//   const videoItems = await input.getInputs(inputOptions)
//   return videoItems
// }

const startDownload = async () => {
  const instance = outputOptions.value as ComponentPublicInstance
  const output = selectedOutput.value
  try {
    busy.value = true
    const input = selectedInput.value as DownloadVideoInput
    const api = selectedApi.value as DownloadVideoApi
    const videoInputs = await input.getInputs(inputOptions)
    if (videoInputs.length === 0) {
      Toast.info('未接收到视频, 如果输入源支持批量, 请至少选择一个视频.', '下载视频', 3000)
      return
    }
    videoInputs.forEach(item => {
      item.quality = selectedQuality.value
    })
    const videoInfos = await Promise.all(videoInputs.map(i => api.downloadVideoInfo(i)))
    if (videoInfos.length === 0 || lodash.sumBy(videoInfos, it => it.fragments.length) === 0) {
      Toast.info('未接收到可下载数据, 请检查输入源和格式是否适用于当前视频.', '下载视频', 3000)
      return
    }
    if (useBackupUrls.value) {
      videoInfos.forEach(videoInfo => {
        videoInfo.fragments.forEach(fragment => {
          fragment.url =
            fragment.backupUrls && fragment.backupUrls.length !== 0
              ? fragment.backupUrls.at(0)
              : fragment.url
        })
      })
    }
    const action = new DownloadVideoAction(videoInfos)
    for (const a of assets) {
      const assetsType = a?.getUrls ? action.extraOnlineAssets : action.extraAssets
      assetsType.push({
        asset: a,
        instance: assetsOptions.value.find(c => (c.$attrs.name as string) === a.name),
      })
    }
    await output.runAction(action, instance)
    await action.downloadExtraAssets()
  } catch (error) {
    logError(error)
  } finally {
    busy.value = false
  }
}

onMounted(() => {
  coreApis.observer.videoChange(() => {
    selectedInput.value = undefined
    selectedApi.value = undefined

    const matchedInputs = filterData(inputsRaw)
    inputs.value = matchedInputs
    selectedInput.value = matchedInputs[0]
    const matchedApis = filterData(apisRaw)
    apis.value = matchedApis
    const lastApi = matchedApis.find(api => api.name === basicConfig.api)
    if (lastApi) {
      selectedApi.value = lastApi
    } else {
      selectedApi.value = matchedApis[0]
    }
  })
})
defineExpose({
  open,
})
</script>
<style lang="scss">
@import 'common';

.download-video-panel {
  @include card();
  font-size: 12px;
  padding: 6px;
  top: 100px;
  left: 50%;
  transform: translateX(-50%) scale(0.95);
  transition: 0.2s ease-out;
  z-index: 1000;
  width: 320px;
  height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;

  &.open {
    transform: translateX(-50%);
  }
  .be-textbox,
  .be-textarea {
    flex-grow: 1;
  }
  &-header {
    @include h-center();
    border-bottom: 1px solid #8882;
    padding: 6px 0;
    margin: 0 6px;

    .title {
      font-size: 16px;
      @include semi-bold();
      flex-grow: 1;
      margin: 0 8px;
    }
    .be-button {
      padding: 4px;
    }
  }
  &-content {
    @include no-scrollbar();
    @include v-stretch();
    flex: 1 0 0;
    padding: 12px 6px;
    align-items: flex-start;
    > :not(:first-child) {
      margin-top: 12px;
    }
  }
  .download-video-config-item {
    @include h-center();
    .download-video-config-title {
      margin-right: 8px;
    }
    &.error {
      color: #e57373;
    }
  }
  .download-video-config-section {
    align-self: stretch;
  }
  .download-video-config-description {
    color: #888d;
    margin-top: 4px;
    a {
      color: var(--theme-color-70);
    }
  }
  &-footer {
    @include h-center();
    border-top: 1px solid #8882;
    padding: 6px 0;
    margin: 0 6px;
    justify-content: center;
  }
  .run-download {
    font-size: 13px;
    padding: 6px 12px;
  }
}
</style>

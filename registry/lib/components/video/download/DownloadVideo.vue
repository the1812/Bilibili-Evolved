<template>
  <VPopup v-model="open" fixed class="download-video-panel" :trigger-element="triggerElement">
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
        <VDropdown v-model="selectedInput" :items="inputs" />
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
        <VDropdown v-model="selectedApi" :items="apis" />
      </div>
      <div
        v-if="selectedApi && selectedApi.description"
        class="download-video-config-description"
        v-html="selectedApi.description"
      ></div>
      <div v-if="selectedQuality" class="download-video-config-item">
        <div class="download-video-config-title">清晰度:</div>
        <VDropdown
          v-model="selectedQuality"
          :items="filteredQualities"
          @change="saveSelectedQuality()"
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
        <SwitchBox v-model="useBackupUrls" />
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
        <VDropdown v-model="selectedOutput" :items="outputs" />
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
        @click="startDownload($refs.outputOptions, selectedOutput)"
      >
        开始
      </VButton>
    </div>
  </VPopup>
</template>
<script lang="ts">
import { TestPattern } from '@/core/common-types'
import { getComponentSettings } from '@/core/settings'
import { matchUrlPattern } from '@/core/utils'
import { logError } from '@/core/utils/log'
import { formatFileSize } from '@/core/utils/formatters'
import { VPopup, VButton, VDropdown, VIcon, SwitchBox } from '@/ui'
import { registerAndGetData } from '@/plugins/data'
import { allQualities, VideoQuality } from '@/components/video/video-quality'
import { Toast } from '@/core/toast'
import { getFriendlyTitle } from '@/core/utils/title'
import { bangumiBatchInput } from './inputs/bangumi/batch'
import { videoBatchInput, videoSeasonBatchInput } from './inputs/video/batch'
import { videoSingleInput } from './inputs/video/input'
import { videoDashAvc, videoDashHevc, videoDashAv1, videoAudioDash } from './apis/dash'
import { videoFlv } from './apis/flv'
import { streamSaverOutput } from './outputs/stream-saver'
import {
  DownloadVideoAction,
  DownloadVideoApi,
  DownloadVideoAssets,
  DownloadVideoInput,
  DownloadVideoInputItem,
  DownloadVideoOutput,
} from './types'

const [inputs] = registerAndGetData('downloadVideo.inputs', [
  videoSingleInput,
  videoBatchInput,
  videoSeasonBatchInput,
  bangumiBatchInput,
] as DownloadVideoInput[])
const [apis] = registerAndGetData('downloadVideo.apis', [
  videoFlv,
  videoDashAvc,
  videoDashHevc,
  videoDashAv1,
  videoAudioDash,
] as DownloadVideoApi[])
const [assets] = registerAndGetData('downloadVideo.assets', [] as DownloadVideoAssets[])
const [outputs] = registerAndGetData('downloadVideo.outputs', [
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

export default Vue.extend({
  components: {
    VPopup,
    VButton,
    VDropdown,
    VIcon,
    SwitchBox,
  },
  props: {
    triggerElement: {
      required: true,
    },
  },
  data() {
    const lastOutput = basicConfig.output
    const lastUseBackupUrls = basicConfig.useBackupUrls
    return {
      open: false,
      busy: false,
      // 测试 videoInfo, 用于获取清晰度列表和预计大小
      testData: {
        // undefined: 无法获取; null: 获取中;
        videoInfo: null,
        // 是否有多P
        multiple: false,
      },
      assets,
      qualities: [],
      selectedQuality: undefined,
      inputs: [],
      selectedInput: undefined,
      apis: [],
      selectedApi: undefined,
      outputs,
      selectedOutput: outputs.find(it => it.name === lastOutput) || outputs[0],
      useBackupUrls: lastUseBackupUrls || false,
    }
  },
  computed: {
    assetsWithOptions() {
      return (this.assets as DownloadVideoAssets[]).filter(a => a.component)
    },
    filteredQualities() {
      if (this.qualities.length === 0) {
        return allQualities
      }
      return this.qualities
    },
    canStartDownload() {
      if (this.busy || !this.open) {
        return false
      }
      const isAnySelectionEmpty = Object.entries(this)
        .filter(([key]) => key.startsWith('selected'))
        .some(([, value]) => !value)
      if (isAnySelectionEmpty) {
        return false
      }
      return true
    },
  },
  watch: {
    selectedInput(input: DownloadVideoInput) {
      if (input === undefined) {
        return
      }
      this.updateTestVideoInfo()
    },
    selectedApi(api: DownloadVideoApi) {
      if (api === undefined) {
        return
      }
      this.updateTestVideoInfo()
      basicConfig.api = api.name
    },
    selectedOutput(output: DownloadVideoOutput) {
      if (output === undefined) {
        return
      }
      basicConfig.output = output.name
    },
    useBackupUrls(useBackupUrls: boolean) {
      if (useBackupUrls === undefined) {
        return
      }
      basicConfig.useBackupUrls = useBackupUrls
    },
  },
  mounted() {
    coreApis.observer.videoChange(() => {
      this.selectedInput = undefined
      this.selectedApi = undefined

      const matchedInputs = filterData(inputs)
      this.inputs = matchedInputs
      this.selectedInput = matchedInputs[0]
      const matchedApis = filterData(apis)
      this.apis = matchedApis
      const lastApi = matchedApis.find(api => api.name === basicConfig.api)
      if (lastApi) {
        this.selectedApi = lastApi
      } else {
        this.selectedApi = matchedApis[0]
      }
    })
  },
  methods: {
    formatFileSize,
    // 只有手动选择的清晰度要记录, 因此不能直接 watch
    saveSelectedQuality() {
      const quality: VideoQuality = this.selectedQuality
      if (quality === undefined) {
        return
      }
      basicConfig.quality = quality.value
      this.updateTestVideoInfo()
    },
    async getVideoItems() {
      const input = this.selectedInput as DownloadVideoInput
      const videoItems = await input.getInputs(this.$refs.inputOptions)
      return videoItems
    },
    async updateTestVideoInfo() {
      if (!this.selectedInput || !this.selectedApi) {
        return
      }
      this.testData.videoInfo = null
      const input = this.selectedInput as DownloadVideoInput
      const testItem = input.getTestInput?.() ?? getFallbackTestVideoInfo()
      console.log('[updateTestVideoInfo]', testItem)
      this.testData.multiple = input.batch
      const api = this.selectedApi as DownloadVideoApi
      try {
        const videoInfo = await api.downloadVideoInfo(testItem)
        this.qualities = videoInfo.qualities
        const isSelectedQualityOutdated =
          !this.selectedQuality ||
          !videoInfo.qualities.some(q => q.value === this.selectedQuality.value)
        if (isSelectedQualityOutdated) {
          this.selectedQuality = videoInfo.qualities[0]
          if (basicConfig.quality) {
            const [matchedQuality] = videoInfo.qualities.filter(q => q.value <= basicConfig.quality)
            if (matchedQuality) {
              this.selectedQuality = matchedQuality
            }
          }
        }
        // 填充 quality 后要再请求一次得到对应 quality 的统计数据
        testItem.quality = this.selectedQuality
        const qualityVideoInfo = await api.downloadVideoInfo(testItem)
        this.testData.videoInfo = qualityVideoInfo
      } catch (error) {
        console.error('[updateTestVideoInfo] failed', error)
        this.testData.videoInfo = undefined
      }
    },
    async startDownload(instance: Vue, output: DownloadVideoOutput) {
      try {
        this.busy = true
        const input = this.selectedInput as DownloadVideoInput
        const api = this.selectedApi as DownloadVideoApi
        const videoInputs = await input.getInputs(this.$refs.inputOptions)
        if (videoInputs.length === 0) {
          Toast.info('未接收到视频, 如果输入源支持批量, 请至少选择一个视频.', '下载视频', 3000)
          return
        }
        videoInputs.forEach(item => {
          item.quality = this.selectedQuality
        })
        const videoInfos = await Promise.all(videoInputs.map(i => api.downloadVideoInfo(i)))
        if (videoInfos.length === 0 || lodash.sumBy(videoInfos, it => it.fragments.length) === 0) {
          Toast.info('未接收到可下载数据, 请检查输入源和格式是否适用于当前视频.', '下载视频', 3000)
          return
        }
        if (this.useBackupUrls) {
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
        assets.forEach(a => {
          const assetsType = a?.getUrls ? action.extraOnlineAssets : action.extraAssets
          assetsType.push({
            asset: a,
            instance: this.$refs.assetsOptions.find((c: any) => c.$attrs.name === a.name),
          })
        })
        await output.runAction(action, instance)
        await action.downloadExtraAssets()
      } catch (error) {
        logError(error)
      } finally {
        this.busy = false
      }
    },
  },
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

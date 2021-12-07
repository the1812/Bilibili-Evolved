<template>
  <VPopup
    v-model="open"
    class="play-mpv-panel"
    :trigger-element="triggerElement"
  >
    <div class="play-mpv-panel-header">
      <VIcon icon="mdi-download" />
      <div class="title">
        MPV播放
      </div>
      <VButton type="transparent" title="关闭" @click="open = false">
        <VIcon icon="mdi-close" :size="20" />
      </VButton>
    </div>
    <div
      v-if="selectedInput"
      class="play-mpv-config-item"
    >
      <div class="play-mpv-config-title">
        输入源:
      </div>
      <VDropdown
        v-model="selectedInput"
        :items="inputs"
      />
    </div>
    <div
      v-if="inputs.length === 0"
      class="play-mpv-config-item error"
    >
      没有匹配的输入源, 请确保安装了适合此页面的插件.
    </div>
    <component
      :is="selectedInput.component"
      v-if="selectedInput && selectedInput.component"
      ref="inputOptions"
    />
    <div
      v-if="selectedApi"
      class="play-mpv-config-item"
    >
      <div class="play-mpv-config-title">
        格式:
      </div>
      <VDropdown
        v-model="selectedApi"
        :items="apis"
      />
    </div>
    <div
      v-if="selectedApi && selectedApi.description"
      class="play-mpv-config-description"
      v-html="selectedApi.description"
    >
    </div>
    <div
      v-if="selectedQuality"
      class="play-mpv-config-item"
    >
      <div class="play-mpv-config-title">
        清晰度:
      </div>
      <VDropdown
        v-model="selectedQuality"
        :items="filteredQualities"
        @change="saveSelectedQuality()"
      />
    </div>
    <template v-if="!testData.multiple && selectedQuality">
      <div
        v-if="testData.videoInfo"
        class="play-mpv-config-description"
      >
        预计大小: {{ formatFileSize(testData.videoInfo.totalSize) }}
      </div>
      <div
        v-if="testData.videoInfo === null"
        class="play-mpv-config-description"
      >
        正在计算大小
      </div>
    </template>
    <component
      :is="a.component"
      v-for="a of assetsWithOptions"
      :key="a.name"
      ref="assetsOptions"
      :name="a.name"
    />
    <div
      v-if="selectedOutput"
      class="play-mpv-config-item"
    >
      <div class="play-mpv-config-title">
        输出方式:
      </div>
      <VDropdown
        v-model="selectedOutput"
        :items="outputs"
      />
    </div>
    <div
      v-if="selectedOutput && selectedOutput.description"
      class="play-mpv-config-description"
    >
      {{ selectedOutput.description }}
    </div>
    <component
      :is="selectedOutput.component"
      v-if="selectedOutput && selectedOutput.component"
      ref="outputOptions"
    />

    <div class="play-mpv-panel-footer">
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
import {
  VPopup, VButton, VDropdown, VIcon,
} from '@/ui'
import { registerAndGetData } from '@/plugins/data'
import { allQualities, VideoQuality } from '@/components/video/video-quality'
import { Toast } from '@/core/toast'
import { bangumiBatchInput } from './inputs/bangumi/batch'
import { videoBatchInput } from './inputs/video/batch'
import { videoSingleInput } from './inputs/video/input'
import { videoDashAVC, videoDashHEVC, audioDash } from './apis/dash'
import { videoFlv } from './apis/flv'
import { toastOutput } from './outputs/toast'
import {
  PlayMpvAction,
  PlayMpvApi,
  PlayMpvAssets,
  PlayMpvInput,
  PlayMpvInputItem,
  PlayMpvOutput,
} from './types'

const [inputs] = registerAndGetData(
  'playMpv.inputs', [
    videoSingleInput,
    videoBatchInput,
    bangumiBatchInput,
  ] as PlayMpvInput[],
)
const [apis] = registerAndGetData(
  'playMpv.apis', [
    videoFlv,
    videoDashAVC,
    videoDashHEVC,
    audioDash,
  ] as PlayMpvApi[],
)
const [assets] = registerAndGetData(
  'playMpv.assets', [] as PlayMpvAssets[],
)
const [outputs] = registerAndGetData(
  'playMpv.outputs', [
    toastOutput,
  ] as PlayMpvOutput[],
)
const { basicConfig } = getComponentSettings('playMpv').options as {
  basicConfig: {
    api: string
    quality: number
    output: string
  }
}
const filterData = (items: { match?: TestPattern }[]) => {
  const matchedItems = items.filter(it => it.match?.some(p => matchUrlPattern(p)) ?? true)
  return matchedItems
}

export default Vue.extend({
  components: {
    VPopup, VButton, VDropdown, VIcon,
  },
  props: {
    triggerElement: {
      required: true,
    },
  },
  data() {
    const lastApi = basicConfig.api
    const lastOutput = basicConfig.output
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
      apis,
      selectedApi: apis.find(it => it.name === lastApi) || apis[0],
      outputs,
      selectedOutput: outputs.find(it => it.name === lastOutput) || outputs[0],
    }
  },
  computed: {
    assetsWithOptions() {
      return (this.assets as PlayMpvAssets[]).filter(a => a.component)
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
      const isAnySelectionEmpty = Object.entries(this).filter(([key]) => key.startsWith('selected')).some(([, value]) => !value)
      if (isAnySelectionEmpty) {
        return false
      }
      return true
    },
  },
  watch: {
    selectedInput(input: PlayMpvInput) {
      if (input === undefined) {
        return
      }
      this.updateTestVideoInfo()
    },
    selectedApi(api: PlayMpvApi) {
      if (api === undefined) {
        return
      }
      this.updateTestVideoInfo()
      basicConfig.api = api.name
    },
    selectedOutput(output: PlayMpvOutput) {
      if (output === undefined) {
        return
      }
      basicConfig.output = output.name
    },
  },
  mounted() {
    coreApis.observer.videoChange(() => {
      const matchedInputs = filterData(inputs)
      this.inputs = matchedInputs
      this.selectedInput = matchedInputs[0]
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
      const input = this.selectedInput as PlayMpvInput
      const videoItems = await input.getInputs(this.$refs.inputOptions)
      return videoItems
    },
    async updateTestVideoInfo() {
      if (!this.selectedInput) {
        return
      }
      this.testData.videoInfo = null
      const items: PlayMpvInputItem[] = await this.getVideoItems()
      console.log('[updateTestVideoInfo]', items)
      this.testData.multiple = items.length > 1
      const api = this.selectedApi as PlayMpvApi
      const [firstItem] = items
      // 没有清晰度信息时先获取清晰度列表
      if (!this.selectedQuality) {
        const videoInfo = await api.playMpvInfo(firstItem)
        this.qualities = videoInfo.qualities
        this.selectedQuality = videoInfo.qualities[0]
        if (basicConfig.quality) {
          const [matchedQuality] = videoInfo.qualities.filter(q => q.value <= basicConfig.quality)
          if (matchedQuality) {
            this.selectedQuality = matchedQuality
          }
        }
      }
      try {
        firstItem.quality = this.selectedQuality
        const videoInfo = await api.playMpvInfo(firstItem)
        this.testData.videoInfo = videoInfo
      } catch (error) {
        this.testData.videoInfo = undefined
      }
    },
    async startDownload(instance: Vue, output: PlayMpvOutput) {
      try {
        this.busy = true
        const input = this.selectedInput as PlayMpvInput
        const api = this.selectedApi as PlayMpvApi
        const videoInputs = await input.getInputs(this.$refs.inputOptions)
        if (videoInputs.length === 0) {
          Toast.info('未接收到视频, 如果输入源支持批量, 请至少选择一个视频.', 'MPV播放', 3000)
          return
        }
        videoInputs.forEach(item => {
          item.quality = this.selectedQuality
        })
        const videoInfos = await Promise.all(videoInputs.map(i => api.playMpvInfo(i)))
        if (videoInfos.length === 0 || lodash.sumBy(videoInfos, it => it.fragments.length) === 0) {
          Toast.info('未接收到可下载数据, 请检查输入源和格式是否适用于当前视频.', 'MPV播放', 3000)
          return
        }
        const action = new PlayMpvAction(videoInfos)
        const extraAssets = (await Promise.all(
          assets.map(a => a.getAssets(
            videoInfos,
            this.$refs.assetsOptions.find((c: any) => c.$attrs.name === a.name),
          )),
        )).flat()
        action.extraAssets.push(...extraAssets)
        await action.downloadExtraAssets()
        await output.runAction(action, instance)
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
@import "common";
.play-mpv-panel {
  font-size: 12px;
  top: 100px;
  left: 50%;
  transform: translateX(-50%) scale(0.95);
  transition: .2s ease-out;
  z-index: 1000;
  width: 320px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 12px;

  @include card();
  &.open {
    transform: translateX(-50%);
  }
  > :not(:first-child) {
    margin-top: 12px;
  }
  .be-textbox,
  .be-textarea {
    flex-grow: 1;
  }
  &-header {
    @include h-center();
    align-self: stretch;

    .title {
      font-size: 16px;
      font-weight: bold;
      flex-grow: 1;
      margin: 0 8px;
    }
    .be-button {
      padding: 4px;
    }
  }
  .play-mpv-config-item {
    @include h-center();
    .play-mpv-config-title {
      margin-right: 8px;
    }
    &.error {
      color: #E57373;
    }
  }
  .play-mpv-config-section {
    align-self: stretch;
  }
  .play-mpv-config-description {
    opacity: .5;
    margin-top: 4px;
  }
  &-footer {
    align-self: stretch;
    justify-content: center;
    @include h-center();
  }
  .run-download {
    font-size: 13px;
    padding: 6px 12px;
  }
}
</style>

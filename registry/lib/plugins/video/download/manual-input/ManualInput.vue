<template>
  <div class="manual-input download-video-config-section">
    <TextArea v-model="inputText" placeholder="输入 av 号或 BV 号, 空格或换行分隔" />
    <div class="manual-input-stats download-video-config-description">
      已输入 {{ ids.length }} 个视频
    </div>
    <div class="manual-input-description download-video-config-description">
      手动输入可以自行输入要下载的视频编号, 但下面清晰度的选择依然是以当前视频为准的,
      所以建议在高清的视频页面里操作. 批量命名格式至少需要包含 title 和 ep 变量.
    </div>
    <div class="manual-input-description download-video-config-description">
      一次最多 36 个视频, 请勿短时间进行大量下载, 以免遭到 b 站封禁.
    </div>
  </div>
</template>
<script lang="ts">
import { TextArea } from '@/ui'

export default Vue.extend({
  components: {
    TextArea,
  },
  data() {
    return {
      inputText: '',
    }
  },
  computed: {
    ids() {
      const input: string = this.inputText
      const maxDownloadCount = 36
      const idRegex = /(BV.+)|av(\d+)/i
      return input
        .split(/\n| /)
        .map(it => {
          const trimmed = it.trim()
          if (/^\d+$/.test(trimmed)) {
            return `av${trimmed}`
          }
          return trimmed
        })
        .filter(it => idRegex.test(it))
        .map(it => {
          const match = it.match(idRegex)
          return match[1] ?? match[2]
        })
        .slice(0, maxDownloadCount)
    },
  },
})
</script>
<style lang="scss">
.manual-input.download-video-config-section {
  .be-text-area {
    min-height: 200px;
  }
}
</style>

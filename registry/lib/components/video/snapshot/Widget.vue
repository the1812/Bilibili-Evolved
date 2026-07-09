<template>
  <div>
    <DefaultWidget
      :disabled="disabled"
      name="查看预览图"
      icon="mdi-image-outline"
      class="view-video-snapshot-grid"
      @click="viewSnapshotGrid"
    ></DefaultWidget>
  </div>
</template>

<script lang="ts">
import { DefaultWidget, openCanvasViewer } from '@/ui'
import { logError } from '@/core/utils/log'
import { createSnapshotGrid, getOptions } from './handler'
import { videoChange } from '@/core/observer'
import { getFriendlyTitle } from '@/core/utils/title'

export default Vue.extend({
  components: {
    DefaultWidget,
  },
  data() {
    return {
      disabled: false,
      canvas: <HTMLCanvasElement>null,
    }
  },
  mounted() {
    videoChange(() => {
      this.canvas = null
    })
  },
  methods: {
    async viewSnapshotGrid() {
      try {
        this.disabled = true
        const { aid, cid } = unsafeWindow
        const viewer = await openCanvasViewer()
        if (!this.canvas) {
          this.canvas = await createSnapshotGrid(parseInt(aid), parseInt(cid))
        }
        if ((await viewer.setCanvas(this.canvas)) && getOptions().enablePreviewDownload) {
          await viewer.setDownloadable(`${getFriendlyTitle(true)}_snapshot.jpg`)
        }
      } catch (error) {
        logError(error)
      } finally {
        this.disabled = false
      }
    },
  },
})
</script>

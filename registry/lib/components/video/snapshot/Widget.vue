<template>
  <div>
    <DefaultWidget
      :disabled="disabled"
      name="查看预览图"
      icon="mdi-image-multiple-outline"
      class="view-video-snapshot-grid"
      @click="viewSnapshotGrid"
    ></DefaultWidget>
  </div>
</template>

<script lang="ts">
import { DefaultWidget } from '@/ui'
import { createSnapshotGrid, getOptions, openViewer, getConsole } from './handler'
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
      if (this.disabled) {
        return
      }
      const viewer = await openViewer()
      this.disabled = true
      try {
        const { aid, cid } = unsafeWindow
        if (!this.canvas) {
          this.canvas = await createSnapshotGrid(parseInt(aid), parseInt(cid))
        }
        if ((await viewer.setCanvas(this.canvas)) && getOptions().enablePreviewDownload) {
          await viewer.setDownloadable(`${getFriendlyTitle(true)}_snapshot.jpg`)
        }
      } catch (error) {
        viewer.setLoadingMessage(error)
        getConsole().error(error)
      } finally {
        this.disabled = false
      }
    },
  },
})
</script>

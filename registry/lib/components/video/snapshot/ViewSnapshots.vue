<template>
  <DefaultWidget
    :disabled="disabled"
    name="查看预览图"
    icon="mdi-image-outline"
    class="view-video-snapshot-grid"
    @click="viewSnapshotGrid()"
  ></DefaultWidget>
</template>

<script lang="ts">
import { DefaultWidget, showImage } from '@/ui'
import { logError } from '@/core/utils/log'
import { renderSnapshotGridToBlobUrl } from './handler'
import { videoChange } from '@/core/observer'
import { getFriendlyTitle } from '@/core/utils/title'

export default Vue.extend({
  components: {
    DefaultWidget,
  },
  data() {
    return {
      disabled: false,
      imageBlobUrl: '',
    }
  },
  mounted() {
    videoChange(() => {
      URL.revokeObjectURL(this.imageBlobUrl)
      this.imageBlobUrl = ''
    })
  },
  methods: {
    async viewSnapshotGrid() {
      try {
        this.disabled = true
        if (!this.imageBlobUrl) {
          const { aid, cid } = unsafeWindow
          this.imageBlobUrl = await renderSnapshotGridToBlobUrl(aid, parseInt(cid))
        }
        showImage(this.imageBlobUrl, `${getFriendlyTitle(true)}_snapshot.jpg`)
      } catch (error) {
        logError(error)
      } finally {
        this.disabled = false
      }
    },
  },
})
</script>

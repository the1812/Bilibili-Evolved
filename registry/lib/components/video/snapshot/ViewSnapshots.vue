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
import { DefaultWidget } from '@/ui'
import { logError } from '@/core/utils/log'
import { view } from './handler'

export default Vue.extend({
  components: {
    DefaultWidget,
  },
  data() {
    return {
      disabled: false,
    }
  },
  methods: {
    async viewSnapshotGrid() {
      try {
        this.disabled = true
        const { aid, cid } = unsafeWindow
        await view(aid, parseInt(cid))
      } catch (error) {
        logError(error)
      } finally {
        this.disabled = false
      }
    },
  },
})
</script>

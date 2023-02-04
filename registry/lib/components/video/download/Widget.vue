<template>
  <div class="multiple-widgets">
    <DefaultWidget
      ref="button"
      name="下载视频"
      icon="mdi-download"
      @mouseover="createDownloadPanel()"
      @click="toggleDownloadPanel()"
    ></DefaultWidget>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { mountVueComponent } from '@/core/utils'

import type DownloadVideo from './DownloadVideo.vue'

let panel: InstanceType<typeof DownloadVideo> | undefined
export default defineComponent({
  components: {
    DefaultWidget: coreApis.ui.DefaultWidget,
  },
  methods: {
    async createDownloadPanel() {
      if (!panel) {
        const [el, vm] = mountVueComponent(await import('./DownloadVideo.vue'), {
          triggerElement: this.$refs.button,
        })
        panel = vm
        document.body.appendChild(el)
      }
    },
    async toggleDownloadPanel() {
      if (!panel) {
        return
      }
      panel.open = !panel.open
    },
  },
})
</script>

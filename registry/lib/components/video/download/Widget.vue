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
import type { Ref } from 'vue'
import { defineComponent, ref } from 'vue'
import { mountVueComponent } from '@/core/utils'

import type DownloadVideo from './DownloadVideo.vue'

let panel: InstanceType<typeof DownloadVideo> | undefined
export default defineComponent({
  components: {
    DefaultWidget: coreApis.ui.DefaultWidget,
  },
  setup: () => ({
    button: ref(null) as Ref<HTMLDivElement | null>,
  }),
  methods: {
    async createDownloadPanel() {
      if (!panel) {
        const [el, vm] = mountVueComponent(await import('./DownloadVideo.vue'), {
          triggerElement: this.button,
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

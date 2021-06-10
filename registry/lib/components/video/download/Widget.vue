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
let panel: { open: boolean } & Vue
export default Vue.extend({
  components: {
    DefaultWidget: coreApis.ui.DefaultWidget,
  },
  methods: {
    async createDownloadPanel() {
      if (!panel) {
        const holder = document.createElement('div')
        document.body.appendChild(holder)
        const DownloadVideoPanel = await import('./DownloadVideo.vue').then(m => m.default)
        panel = new DownloadVideoPanel({
          propsData: {
            triggerElement: this.$refs.button,
          },
        }).$mount(holder)
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

<template>
  <div class="bigger-preview-video-container">
    <VPopup v-model="showPopup">
      <div>弹窗内容</div>
    </VPopup>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { VPopup } from '@/ui'

export default defineComponent({
  name: 'VideoContainer',
  components: {
    VPopup,
  },
  data() {
    return {
      showPopup: false,
    }
  },
  methods: {
    openPopup() {
      this.showPopup = true
    },
    closePopup() {
      this.showPopup = false
    },
  },
})
</script>

<style lang="scss">
.bigger-preview-video-container {
  position: absolute;
}
</style>

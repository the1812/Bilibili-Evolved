<template>
  <DefaultWidget
    name="画中画"
    icon="mdi-picture-in-picture-bottom-right"
    class="live-pip"
    @click="togglePip()"
  ></DefaultWidget>
</template>

<script lang="ts">
import { dq } from '@/core/utils'

export default Vue.extend({
  components: {
    DefaultWidget: () => import('@/widgets/DefaultWidget.vue').then(m => m.default),
  },
  methods: {
    async togglePip() {
      if (document.pictureInPictureElement === dq('video')) {
        document.exitPictureInPicture()
      } else {
        (dq('video') as HTMLVideoElement)?.requestPictureInPicture()
      }
    },
  },
})
</script>

<style lang="scss">
.live-pip .be-icon {
  transform: scale(0.9);
}
</style>

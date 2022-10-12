<template>
  <VPopup
    v-model="show"
    :lazy="false"
    fixed
    class="global-launch-bar-container"
    @keydown.esc.capture="close()"
  >
    <LaunchBar ref="launchBar" @close="close()" />
  </VPopup>
</template>
<script lang="ts">
import VPopup from '@/ui/VPopup.vue'
import LaunchBar from './LaunchBar.vue'

export default Vue.extend({
  components: {
    LaunchBar,
    VPopup,
  },
  data() {
    return {
      show: true,
    }
  },
  watch: {
    show(value: boolean) {
      if (value) {
        this.focus()
      }
    },
  },
  async mounted() {
    await this.$nextTick()
    this.focus()
  },
  methods: {
    focus() {
      const input = this.$refs.launchBar?.$refs.input as HTMLInputElement
      input?.focus()
      input?.select()
    },
    close() {
      this.show = false
      const input = this.$refs.launchBar?.$refs.input as HTMLInputElement
      input?.blur()
    },
  },
})
</script>
<style lang="scss">
@import 'common';

.global-launch-bar-container {
  $barHeight: 50px;
  display: flex;
  top: 20vh;
  left: 50%;
  width: 40vw;
  max-width: 650px;
  height: $barHeight;
  padding: 0 8px;
  z-index: 5000;
  @include popup();
  border: 1px solid #8882;
  font-size: 16px;
  transform: translateX(-50%);
  transition: opacity 0.2s ease-out;

  .launch-bar {
    flex: 1;
    body.dark & {
      --color: #eee;
    }
    .launch-bar-suggest-list {
      transition: 0.2s ease-out;
      top: calc(100% + 8px);
      max-height: calc(80vh - 16px - #{$barHeight});
      @include no-scrollbar();
      font-size: 14px;
    }
  }
}
</style>

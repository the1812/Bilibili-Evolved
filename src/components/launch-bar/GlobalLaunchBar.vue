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
<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import VPopup from '@/ui/VPopup.vue'
import LaunchBar from './LaunchBar.vue'

const launchBar = ref<InstanceType<typeof LaunchBar>>()

const show = ref(true)

const focus = () => {
  const input = launchBar.value?.input as HTMLInputElement
  input?.focus()
  input?.select()
}

const close = () => {
  show.value = false
  const input = launchBar.value?.input as HTMLInputElement
  input?.blur()
}

watch(show, (value: boolean) => {
  if (value) {
    focus()
  }
})

onMounted(async () => {
  await nextTick()
  focus()
})

defineExpose({
  show,
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
      top: calc(100% + 8px);
      max-height: calc(80vh - 16px - #{$barHeight});
      @include no-scrollbar();
      font-size: 14px;
    }
  }
}
</style>

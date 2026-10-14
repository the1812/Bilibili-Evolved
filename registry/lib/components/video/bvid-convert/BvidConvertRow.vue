<template>
  <div class="bvid-convert-item">
    {{ id }}
    <div class="bvid-convert-item-copy" title="复制链接" @click="copy">
      <VIcon
        :size="16"
        :icon="copying ? 'mdi-loading' : copied ? 'mdi-check' : 'mdi-link'"
        :class="{ 'mdi-spin': copying }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { logError } from '@/core/utils/log'
import { VIcon } from '@/ui'

const props = defineProps<{
  id: string
  copyLink: (id: string) => Promise<void>
}>()
const copying = ref(false)
const copied = ref(false)
const copy = async () => {
  if (copying.value || copied.value) {
    return
  }
  copying.value = true
  try {
    await props.copyLink(props.id)
    copied.value = true
    setTimeout(() => (copied.value = false), 1000)
  } catch (error) {
    logError(error)
  } finally {
    copying.value = false
  }
}
</script>

<style lang="scss" scoped>
@import 'common';
.bvid-convert-item {
  font-size: 14px;
  @include h-center(6px);
  &-copy {
    transition: transform 0.3s ease-out;
    cursor: pointer;
    &:active {
      transform: scale(0.9);
    }
  }
}
</style>

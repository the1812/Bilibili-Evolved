<template>
  <div
    class="component-action"
    :class="{ disabled: unavailable }"
    :aria-disabled="unavailable"
    :title="item.title"
    @click="handleClick"
  >
    <VIcon :icon="item.icon" :size="16" />
    {{ item.displayName }}
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { VIcon } from '@/ui'
import type { ComponentMetadata } from '../../types'
import type { ComponentConfigAction } from './component-actions'

const props = defineProps<{
  item: ComponentConfigAction
  component?: ComponentMetadata
  disabled?: boolean
}>()
const running = ref(false)
const unavailable = computed(() => props.disabled || running.value)

const handleClick = async () => {
  if (unavailable.value) {
    return
  }
  try {
    running.value = true
    await props.item.action(props.component)
  } finally {
    running.value = false
  }
}
</script>
<style lang="scss">
@import 'common';

.component-action {
  @include h-center(6px);
  cursor: pointer;
  user-select: none;
  border-radius: 4px;
  padding: 4px 8px 4px 6px;
  font-size: 13px;

  &:hover {
    background-color: #8884;
  }
  &.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}
</style>

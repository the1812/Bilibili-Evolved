<template>
  <div class="episode-select-actions" :class="{ compact }">
    <VButton
      v-for="action of selectActions"
      :key="action.name"
      :class="action.name"
      :title="action.title"
      type="transparent"
      @click.stop="applySelectAction(action)"
    >
      <VIcon :size="compact ? 14 : 16" :icon="action.icon" />
    </VButton>
  </div>
</template>
<script setup lang="ts">
import { VButton, VIcon } from '@/ui'
import type { EpisodeItem } from './episode-item'

interface SelectAction {
  name: string
  title: string
  icon: string
  /** 目标选中状态, 省略时表示反选 */
  isChecked?: boolean
}

const selectActions: SelectAction[] = [
  {
    name: 'select-all',
    title: '全选',
    icon: 'mdi-checkbox-multiple-marked-circle',
    isChecked: true,
  },
  {
    name: 'deselect-all',
    title: '全不选',
    icon: 'mdi-checkbox-multiple-blank-circle-outline',
    isChecked: false,
  },
  { name: 'invert-selection', title: '反选', icon: 'mdi-circle-slice-4' },
]

const props = defineProps<{
  items: EpisodeItem[]
  compact?: boolean
}>()

const applySelectAction = (action: SelectAction) => {
  props.items.forEach(it => {
    it.isChecked = action.isChecked ?? !it.isChecked
  })
}
</script>
<style lang="scss">
@import 'common';
.episode-select-actions {
  @include h-center();
  .be-button {
    padding: 4px;
    &.invert-selection .be-icon {
      font-size: 14px;
    }
    &.select-all .be-icon,
    &.deselect-all .be-icon {
      transform: translateY(1px);
    }
  }
  &.compact {
    gap: 4px;
    .be-button {
      padding: 2px;
      &.invert-selection .be-icon {
        font-size: 12px;
      }
    }
  }
}
</style>

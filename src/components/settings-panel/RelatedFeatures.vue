<template>
  <div class="component-detail-section">
    <div class="component-detail-section-title">{{ title }}</div>
    <div class="related-features" :class="{ 'dev-mode': showNames }">
      <div
        v-for="entry of entries"
        :key="entry.feature.name"
        class="related-feature"
        @click="emit('open-feature', entry.feature)"
      >
        <div class="related-feature-label">
          <div>{{ entry.displayName ?? entry.feature.displayName }}</div>
          <div v-if="showNames" class="related-feature-name">{{ entry.feature.name }}</div>
        </div>
        <VIcon icon="right-arrow" class="related-feature-arrow" :size="18" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VIcon } from '@/ui'
import type { RelatedSettingsFeature, SettingsFeature } from './settings-feature'

defineProps<{
  title: string
  showNames: boolean
  entries: RelatedSettingsFeature[]
}>()
const emit = defineEmits<{ (event: 'open-feature', feature: SettingsFeature): void }>()
</script>

<style lang="scss">
@import 'common';

.related-features {
  @include v-stretch(4px);
  padding-block-start: 2px;
  overflow-wrap: anywhere;

  &.dev-mode {
    padding-block-start: 6px;
    gap: 12px;
  }

  &:not(.dev-mode) .related-feature {
    min-height: 24px;
  }

  .related-feature {
    @include h-center(6px);
    justify-content: space-between;
    cursor: pointer;

    &-name {
      opacity: 0.5;
      font-size: 11px;
    }

    &-arrow {
      flex-shrink: 0;
      opacity: 0.75;
      transition: color 0.2s ease-out;
    }

    &:hover .related-feature-arrow {
      color: var(--theme-color);
    }
  }
}
</style>

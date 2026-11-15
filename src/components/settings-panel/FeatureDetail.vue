<template>
  <div class="component-detail">
    <div class="component-detail-header">
      <div class="display-name" :title="feature.displayName">{{ feature.displayName }}</div>
      <div class="component-detail-header-actions">
        <DetailActionMenu :actions="actions.menu" />
        <VIcon class="close" icon="close" :size="18" @click="emit('close')" />
      </div>
    </div>
    <div v-if="tags.length > 0" class="component-detail-tags">
      <div v-for="tag of tags" :key="tag.name" class="tag">
        <div class="tag-color" :style="{ backgroundColor: tag.color }"></div>
        {{ tag.displayName }}
      </div>
    </div>
    <DetailActionButtons :actions="actions.buttons" />
    <FeatureVersionInfo :feature="feature" :show-name="detail.showName || devMode" />
    <div class="component-detail-separator"></div>
    <template v-if="detail.section">
      <component :is="detail.section.view" v-bind="detail.section.props" />
      <div class="component-detail-separator"></div>
    </template>
    <template v-if="related?.entries.length">
      <RelatedFeatures
        :title="related.title"
        :entries="related.entries"
        :show-names="devMode"
        @open-feature="emit('open-feature', $event)"
      />
      <div class="component-detail-separator"></div>
    </template>
    <ComponentDescription
      v-if="detail.description"
      class="component-detail-description"
      :component-data="detail.description"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { VIcon } from '@/ui'
import { addComponentListener, removeComponentListener } from '@/core/settings'
import ComponentDescription from './ComponentDescription.vue'
import { useComponentData } from './component-data'
import DetailActionButtons from './component-actions/DetailActionButtons.vue'
import DetailActionMenu from './component-actions/DetailActionMenu.vue'
import { getSettingsDetailActions } from './component-actions/component-actions'
import FeatureVersionInfo from './FeatureVersionInfo.vue'
import RelatedFeatures from './RelatedFeatures.vue'
import type { SettingsFeature } from './settings-feature'

const props = defineProps<{ feature: SettingsFeature; features: SettingsFeature[] }>()
const emit = defineEmits<{
  (event: 'close'): void
  (event: 'open-feature', feature: SettingsFeature): void
}>()
const detail = computed(() => props.feature.detail)
const tags = computed(() => props.feature.row.tags ?? [])
const actions = useComponentData(() => getSettingsDetailActions(props.feature))
const related = computed(() => props.feature.related?.(props.features))
const devMode = ref(false)
const updateDevMode = (enabled: boolean) => {
  devMode.value = enabled
}
addComponentListener('settingsPanel.devMode', updateDevMode, true)
onUnmounted(() => removeComponentListener('settingsPanel.devMode', updateDevMode))
</script>

<style lang="scss">
@import 'common';

.component-detail {
  min-width: 264px;
  width: 264px;
  flex: 1;
  background-color: inherit;
  border-radius: 7px;
  overflow: auto;
  overscroll-behavior: contain;
  @include v-stretch();

  .extra-option {
    display: flow-root;
  }
  &-separator {
    height: 1px;
    border-bottom: 1px solid #8882;
    margin: 8px 0;
    flex-shrink: 0;
    align-self: stretch;
    box-sizing: border-box;
  }
  &-header {
    @include h-center(8px);
    justify-content: space-between;
    padding: 12px;
    background-color: inherit;
    position: sticky;
    top: 0;
    z-index: 2;

    .display-name {
      min-width: 0;
      @include single-line();
      @include semi-bold();
      font-size: 16px;
    }
    &-actions {
      @include h-center(4px);
      flex-shrink: 0;
    }
    .close {
      cursor: pointer;
      &:hover {
        color: var(--theme-color);
      }
    }
    .extra-actions {
      cursor: pointer;
    }
    .extra-actions-list {
      width: max-content;
    }
    .tippy-content {
      padding: 4px;
    }
  }
  &-description {
    padding: 0 12px 6px;
  }
  &-tags {
    @include h-center();
    flex-wrap: wrap;
    padding: 0 8px 8px;
    .tag {
      @include h-center();
      @include card();
      @include round-bar(24);
      padding: 2px 6px;
      margin-right: 4px;
      margin-bottom: 4px;
      font-size: 12px;
      box-shadow: none;
      .tag-color {
        border-radius: 50%;
        width: 12px;
        height: 12px;
        margin-right: 4px;
      }
    }
  }
  &-internal-data {
    padding: 0 12px 0;
    color: var(--be-color-muted, #888);
    line-height: 20px;
    .component-detail-metadata-row {
      @include h-center(2px);
      transform: translateX(-2px);
    }
    .component-detail-internal-name > .be-icon {
      box-sizing: content-box;
      padding: 1px;
    }
    .commit-warning {
      color: #ff9800;
    }
  }
  &-internal-name {
    overflow-wrap: anywhere;
  }
  &-header + &-operations {
    padding-top: 3px;
  }
  &-operations {
    @include h-stretch(8px);
    flex-wrap: wrap;
    padding: 0 12px 8px;
    > * {
      flex: 1 0 auto;
      .be-icon {
        margin-right: 6px;
      }
    }
    &:empty {
      display: none;
    }
  }
  &-section {
    padding: 8px 12px;

    &-title {
      @include semi-bold();
      font-size: 14px;
      margin-bottom: 8px;
    }
    .generated-option:not(:last-child) {
      margin-bottom: 4px;
    }
  }
}
</style>

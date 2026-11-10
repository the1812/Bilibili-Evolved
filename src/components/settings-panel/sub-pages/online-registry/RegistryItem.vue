<template>
  <div class="online-registry-item">
    <div class="online-registry-item-header">
      <TagRing v-if="item.componentTags.length" :tags="item.componentTags" />
      <VIcon
        v-else
        :size="18"
        :icon="item.type === 'plugin' ? 'mdi-puzzle-outline' : 'mdi-cube-scan'"
      />
      <div class="online-registry-item-name" :title="item.displayName">{{ item.displayName }}</div>
      <MiniToast container="body" placement="top" theme="online-registry" :delay="[200, 0]">
        <VButton
          icon
          class="online-registry-item-action"
          :type="installed ? 'light' : 'primary'"
          :disabled="installing"
          @click="emit('install')"
        >
          <template v-if="installed && !installing">
            <VIcon :size="16" icon="mdi-check" class="installed-icon" />
            <VIcon :size="16" icon="mdi-reload" class="reinstall-icon" />
          </template>
          <VIcon v-else :size="16" :icon="installing ? 'mdi-progress-clock' : 'mdi-plus'" />
        </VButton>
        <template #toast>{{ actionLabel }}</template>
      </MiniToast>
    </div>
    <MiniToast
      ref="descriptionToast"
      container="body"
      placement="bottom"
      theme="online-registry"
      :delay="[200, 0]"
      @change="$event && (descriptionOpened = true)"
    >
      <div class="online-registry-item-description">{{ item.descriptionText }}</div>
      <template #toast>
        <div v-if="descriptionOpened" class="online-registry-item-details">
          <FeatureAuthors :author="item.author" />
          <ComponentDescription :component-data="item" @hook:updated="updateDescriptionPosition" />
        </div>
      </template>
    </MiniToast>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { MiniToast, VButton, VIcon } from '@/ui'
import ComponentDescription from '../../ComponentDescription.vue'
import FeatureAuthors from '../../FeatureAuthors.vue'
import TagRing from '../../TagRing.vue'
import type { RegistryItemData } from './types'

const props = defineProps<{ item: RegistryItemData; installed: boolean; installing: boolean }>()
const emit = defineEmits<{ (event: 'install'): void }>()
const descriptionOpened = ref(false)
const descriptionToast = ref<InstanceType<typeof MiniToast>>()
const updateDescriptionPosition = () =>
  descriptionToast.value?.toast?.tippy.popperInstance?.update()
const actionLabel = computed(() => {
  if (props.installing) {
    return '正在安装'
  }
  return props.installed ? '重新安装' : '安装'
})
</script>

<style lang="scss">
@import 'common';

.online-registry-item {
  box-sizing: border-box;
  padding: 12px;
  @include border-card();
  @include v-stretch(8px);
  &-header {
    @include h-center(6px);
    .be-icon,
    .tag-ring {
      flex-shrink: 0;
    }
  }
  &-name {
    flex: 1;
    min-width: 0;
    @include semi-bold();
    @include single-line();
  }
  &-action {
    .reinstall-icon {
      display: none;
    }
    &:hover {
      .installed-icon {
        display: none;
      }
      .reinstall-icon {
        display: flex;
      }
    }
  }
  &-description {
    font-size: 13px;
    color: var(--be-color-text-content, #555);
    @include max-line(2);
    height: 2lh;
  }
  &-details {
    @include v-stretch(6px);
  }
}
.tippy-box[data-theme~='online-registry'] {
  .tippy-content {
    font-size: 13px;
    max-height: min(60vh, 440px);
    overflow-y: auto;
    overscroll-behavior: contain;
  }
}
</style>

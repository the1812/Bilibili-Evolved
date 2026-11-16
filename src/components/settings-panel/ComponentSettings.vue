<template>
  <div ref="row" class="component-settings" :class="{ virtual }">
    <template v-if="!virtual">
      <div class="component-settings-row">
        <TagRing v-if="appearance.tags" :tags="appearance.tags" />
        <VIcon v-else :icon="appearance.icon" :size="18" />
        <div class="display-name">
          {{ feature.displayName }}
        </div>
        <SwitchBox v-if="settings" v-model="settings.enabled" />
        <VIcon v-else icon="right-arrow" class="details-arrow" :size="18" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { visibleInside } from '@/core/observer'
import { SwitchBox, VIcon } from '@/ui'
import TagRing from './TagRing.vue'
import type { SettingsFeature } from './settings-feature'

const props = defineProps<{ feature: SettingsFeature }>()
const row = ref<HTMLElement>()
const virtual = ref(false)
const appearance = computed(() => props.feature.row)
const settings = computed(() => {
  const { toggle } = appearance.value
  return toggle && reactive(toggle)
})

let observer: IntersectionObserver
onMounted(() => {
  const element = row.value
  const [rowObserver] = visibleInside(element, element.closest('.main'), '150% 0px', ([record]) => {
    virtual.value = !record.isIntersecting
  })
  observer = rowObserver
})
onUnmounted(() => observer?.disconnect())
</script>

<style lang="scss">
@import 'common';
@import 'markdown';

.component-settings {
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  overflow: hidden;
  padding: 7px 12px 7px 7px;
  width: 100%;
  min-height: 36px;
  position: relative;
  cursor: pointer;
  transition: 0.2s ease-out;
  user-select: none;

  &::after {
    content: '';
    opacity: 0;
    transition: opacity 0.2s ease-out;
    position: absolute;
    top: 0;
    left: 10px;
    height: 100%;
    width: calc(100% - 20px);
    pointer-events: none;
    $color: #8882;
    background-image: repeating-linear-gradient(
      to bottom,
      #0000,
      #0000 10px,
      $color 10px,
      $color 30px,
      #0000 30px,
      #0000 38px,
      $color 38px,
      $color 50px,
      #0000 50px
    );
  }
  &.virtual {
    &::after {
      opacity: 1;
    }
    .component-settings-row {
      display: none;
    }
  }
  // .main-tag-background {
  //   position: absolute;
  //   transform: rotate(-15deg);
  //   right: 4px;
  //   top: 4px;
  //   opacity: 0.1;
  //   pointer-events: none;
  // }
  .component-settings-row {
    @include h-center();
    justify-content: space-between;
    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }
  .display-name {
    font-size: 14px;
    height: 20px;
    flex: 1 0 auto;
    margin-left: 6px;
    width: 200px;
    @include single-line();
    @include h-center();
  }
  .details-arrow {
    opacity: 0.75;
    width: 32px;
    justify-content: flex-end;
  }
  // .description {
  //   @include max-line(2);
  //   height: 36px;
  // }
  // .tags {
  //   @include h-center();
  //   .tag {
  //     height: 12px;
  //     width: 12px;
  //     border-radius: 50%;
  //     &:not(:last-child) {
  //       margin-right: 4px;
  //     }
  //   }
  // }
  .be-switch-box {
    margin: 0;
  }

  &:hover {
    background-color: #8881;
    .options-count {
      opacity: 1;
    }
  }
  &.selected {
    background-color: #8882;
  }
}
</style>

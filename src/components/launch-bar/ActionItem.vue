<template>
  <div
    class="be-launch-bar-action-item be-launch-bar-suggest-item"
    :class="{ focused }"
    :title="action.displayName || action.name"
    :data-indexer="action.indexer"
    role="option"
    :aria-selected="focused"
    @click.self="performAction"
  >
    <div class="be-launch-bar-suggest-item-content">
      <div v-if="action.icon" class="be-launch-bar-suggest-item-icon" @click="performAction">
        <VIcon :icon="action.icon" :size="18" />
      </div>
      <div class="be-launch-bar-suggest-item-title" @click="performAction">
        <component
          :is="action.content"
          v-if="action.content"
          class="be-launch-bar-suggest-item-name"
          :name="action.name"
        ></component>
        <div v-else class="be-launch-bar-suggest-item-name">
          {{ action.displayName || action.name }}
        </div>
        <div
          v-if="action.description"
          class="be-launch-bar-suggest-item-description"
          :title="action.description"
        >
          {{ action.description }}
        </div>
      </div>
      <div
        v-if="action.deleteAction"
        class="be-launch-bar-suggest-item-delete"
        title="删除此项"
        @pointerdown.prevent
        @click="performDelete"
      >
        <VIcon icon="cancel" :size="18" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { VIcon } from '@/ui'
import type { LaunchBarAction } from './launch-bar-action'

interface Props {
  focused?: boolean
  action: LaunchBarAction
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (event: 'action'): void
  (event: 'delete-item'): void
}>()

const performAction = async () => {
  await props.action.action()
  emit('action')
}

const performDelete = async () => {
  if (!props.action.deleteAction) {
    return
  }
  await props.action.deleteAction()
  emit('delete-item')
}
</script>
<style lang="scss">
@import 'common';

.be-launch-bar-suggest-item {
  outline: none !important;
  padding: 6px 6px 6px 10px;
  cursor: pointer;
  &.disabled {
    cursor: default;
    @include h-center();
    justify-content: center;
  }
  &:not(.disabled).focused,
  &:not(.disabled):hover,
  &:not(.disabled):focus-within {
    background-color: #8882;
  }
  &:first-child {
    padding-top: 8px;
    border-radius: 7px 7px 0 0;
  }
  &:last-child {
    padding-bottom: 8px;
    border-radius: 0 0 7px 7px;
  }
  &-content {
    @include h-center();
  }
  &-icon {
    margin-right: 6px;
  }
  &-title {
    @include v-stretch();
    flex: 1 0 0;
    width: 0;
  }
  &-name {
    max-width: 100%;
    @include single-line();
  }
  &-description {
    opacity: 0.5;
    font-size: smaller;
    @include single-line();
  }
  &-delete {
    opacity: 0.5;
    margin-right: 4px;
    &:hover {
      opacity: 1;
    }
  }
}
</style>

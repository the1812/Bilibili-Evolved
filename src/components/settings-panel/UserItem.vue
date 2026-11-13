<template>
  <div class="user-item" :class="{ compact }">
    <div class="user-item-label">
      <div class="user-item-display-name">
        {{ displayName ?? config.item.displayName }}
      </div>
      <div v-if="showName" class="user-item-name">
        {{ config.item.name }}
      </div>
    </div>
    <div v-if="config.isUserItem && !compact" class="user-item-line"></div>
    <MiniToast v-if="config.isUserItem" class="user-item-remove-wrapper" trigger="click">
      <div class="user-item-remove" @dblclick="removeItem()">
        <VIcon icon="mdi-trash-can-outline" :size="compact ? 14 : 18" />
      </div>
      <template #toast>
        <div class="user-item-remove-confirm">
          确定要卸载 {{ config.item.displayName }} 吗?
          <AsyncButton type="primary" @click="removeItem()">
            <VIcon icon="mdi-trash-can-outline" :size="16" />
            确定
          </AsyncButton>
        </div>
      </template>
    </MiniToast>
  </div>
</template>
<script setup lang="ts">
import { AsyncButton, MiniToast, VIcon } from '@/ui'
import type { UserItemConfig } from './user-item'

const props = withDefaults(
  defineProps<{
    config: UserItemConfig
    displayName?: string
    showName?: boolean
    compact?: boolean
  }>(),
  { displayName: undefined, showName: true },
)

const removeItem = () => props.config.onItemRemove(props.config.item)
</script>
<style lang="scss">
@import 'common';

.be-settings .user-item {
  @include h-center(6px);

  &:not(.compact) {
    padding-block: 6px;
  }
  .user-item-name {
    opacity: 0.5;
    font-size: 11px;
  }
  .user-item-line {
    flex: 1;
    transition: 0.2s ease-out;
    opacity: 0;
    height: 0;
    border-bottom: 1px dashed;
  }
  .user-item-remove-confirm {
    @include h-center(8px);
    color: white;
    .be-button {
      flex-shrink: 0;
      white-space: nowrap;
      color: inherit;
      font-size: 12px;
      padding: 4px;
      padding-right: 6px;
      .be-icon {
        margin-right: 4px;
      }
    }
  }
  .tippy-box {
    border-radius: 8px;
    .tippy-content {
      padding-right: 5px;
    }
  }
  .user-item-remove-wrapper {
    margin-left: auto;
    flex-shrink: 0;
  }
  .user-item-remove {
    display: flex;
    align-items: center;
    opacity: 0.1;
    transition: 0.2s ease-out;
    cursor: pointer;
    padding: 4px;
    &:hover {
      opacity: 1;
      color: #e54e4e;
    }
  }
  &:hover {
    .user-item-remove:not(:hover) {
      opacity: 0.75;
    }
    .user-item-line {
      opacity: 0.5;
    }
  }
}
</style>

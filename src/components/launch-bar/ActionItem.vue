<template>
  <div
    tabindex="0"
    class="be-launch-bar-action-item be-launch-bar-suggest-item"
    :title="action.displayName || action.name"
    :data-indexer="action.indexer"
    @click.self="performAction($event)"
    @keydown.enter.prevent.stop="performAction($event)"
    @keydown.shift.delete.prevent.stop="performDelete($event)"
    @keydown.up.prevent.stop="$emit('previous-item', $event.currentTarget)"
    @keydown.down.prevent.stop="$emit('next-item', $event.currentTarget)"
  >
    <div class="be-launch-bar-suggest-item-content">
      <div
        v-if="action.icon"
        class="be-launch-bar-suggest-item-icon"
        @click="performAction($event)"
      >
        <VIcon :icon="action.icon" :size="18" />
      </div>
      <div class="be-launch-bar-suggest-item-title" @click="performAction($event)">
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
        @click="performDelete($event)"
      >
        <VIcon icon="cancel" :size="18" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { VIcon } from '@/ui'

export default Vue.extend({
  components: {
    VIcon,
  },
  props: {
    action: {
      type: Object,
      required: true,
    },
  },
  methods: {
    async performAction(event: KeyboardEvent | MouseEvent) {
      const { currentTarget } = event
      await this.action.action()
      this.$emit('action', currentTarget)
    },
    async performDelete(event: KeyboardEvent | MouseEvent) {
      const { currentTarget } = event
      if (!this.action.deleteAction) {
        return
      }
      await this.action.deleteAction()
      this.$emit('delete-item', currentTarget)
    },
  },
})
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

<template>
  <div class="be-dialog" :style="{ zIndex }" :class="{ open }">
    <div class="be-dialog-header">
      <div v-if="icon" class="be-dialog-header-icon">
        <VIcon :icon="icon" :size="18" />
      </div>
      <div class="be-dialog-header-title">
        <template v-if="typeof title === 'string'">{{ title }}</template>
        <component :is="title" v-else />
      </div>
      <div class="be-dialog-header-close">
        <VButton type="transparent" @click="close()">
          <VIcon icon="close" :size="18" />
        </VButton>
      </div>
    </div>
    <div class="be-dialog-content">
      <template v-if="typeof content === 'string'">{{ content }}</template>
      <component :is="content" v-else-if="content" v-bind="contentProps" @dialog-close="close()" />
    </div>
  </div>
</template>
<script lang="ts">
import { VIcon, VButton } from '@/ui'

export default Vue.extend({
  components: {
    VIcon,
    VButton,
  },
  props: {
    icon: {
      type: String,
      default: '',
    },
    title: {
      default: null,
    },
    zIndex: {
      type: Number,
      default: 100002,
    },
    content: {
      default: null,
    },
    contentProps: {
      default: () => ({}),
    },
  },
  data() {
    return {
      open: false,
      closeListeners: [],
    }
  },
  methods: {
    close() {
      return new Promise<void>(resolve => {
        const element = this.$el as HTMLElement
        const listeners: (() => void)[] = this.closeListeners
        listeners.push(() => {
          this.$emit('close')
          resolve()
        })
        const handler = (e: TransitionEvent) => {
          if (e.target !== this.$el) {
            return
          }
          element.removeEventListener('transitionend', handler)
          listeners.forEach(it => it())
        }
        element.addEventListener('transitionend', handler)
        this.open = false
      })
    },
  },
})
</script>
<style lang="scss">
@import 'common';

.be-dialog {
  @include popup();
  @include v-stretch();
  min-width: 200px;
  min-height: 150px;
  max-width: calc(100vw - 100px);
  max-height: calc(100vh - 100px);
  position: fixed;
  transition: 0.2s ease-out;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%) scale(0.95);
  opacity: 0;
  pointer-events: none;
  &.open {
    transform: translateX(-50%) translateY(-50%) scale(1);
    opacity: 1;
    pointer-events: initial;
  }

  &-header {
    @include h-center(8px);
    justify-content: space-between;
    padding: 12px 12px 12px 16px;
    &-title {
      @include semi-bold();
      font-size: 18px;
    }
    &-close {
      .be-button {
        padding: 6px;
      }
    }
  }
  &-content {
    flex: 1 0 auto;
    overflow: auto;
  }
}
</style>

<template>
  <div
    class="component-action"
    :class="{ disabled }"
    :aria-disabled="disabled"
    :title="item.title"
    @click="handleClick"
  >
    <VIcon :icon="item.icon" :size="16" />
    {{ item.displayName }}
  </div>
</template>
<script lang="ts">
import type { ComponentMetadata } from '@/components/types'
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { ComponentConfigAction } from './component-actions'
import { VIcon } from '@/ui'

export default defineComponent({
  components: {
    VIcon,
  },
  props: {
    item: {
      type: Object as PropType<ComponentConfigAction>,
      required: true,
    },
    component: {
      type: Object as PropType<ComponentMetadata>,
      required: true,
    },
  },
  data() {
    return {
      disabled: false,
    }
  },
  methods: {
    async handleClick() {
      if (this.disabled) {
        return
      }
      try {
        this.disabled = true
        await this.item.action(this.component)
      } finally {
        this.disabled = false
      }
    },
  },
})
</script>
<style lang="scss">
@import 'common';

.component-action {
  @include h-center(6px);
  cursor: pointer;
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

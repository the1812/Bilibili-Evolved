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
import { VIcon } from '@/ui'

export default Vue.extend({
  components: {
    VIcon,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
    component: {
      type: Object,
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

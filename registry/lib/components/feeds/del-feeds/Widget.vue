<template>
  <div class="multiple-widgets">
    <DefaultWidget
      v-for="item in items"
      :key="item.name"
      :disabled="item.disabled"
      :data-name="item.name"
      :name="item.displayName"
      :icon="item.icon"
      @click="runItemAction(item, $event)"
    >
    </DefaultWidget>
  </div>
</template>

<script lang="ts">
import { DefaultWidget } from '@/ui'
import { CheckInItem, checkInItems } from './check-in-item'

export default Vue.extend({
  components: {
    DefaultWidget,
  },
  data() {
    return {
      items: checkInItems,
    }
  },
  methods: {
    async runItemAction(item: CheckInItem, event: MouseEvent) {
      try {
        // 一开始可能是 undefined
        this.$set(item, 'disabled', true)
        const button = this.$el.querySelector(`[data-name='${item.name}']`) as HTMLDivElement
        await item.action(button, event)
      } finally {
        item.disabled = false
      }
    },
  },
})
</script>

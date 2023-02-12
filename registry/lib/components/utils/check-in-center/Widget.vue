<template>
  <div class="multiple-widgets">
    <DefaultWidget
      v-for="item of items"
      :key="item.name"
      :disabled="item.disabled"
      :data-name="item.name"
      :name="item.displayName"
      :icon="item.icon"
      @click="runItemAction(item, $event)"
    ></DefaultWidget>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { DefaultWidget } from '@/ui'

import type { CheckInItem } from './check-in-item'
import { checkInItems } from './check-in-item'

export default defineComponent({
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
        item.disabled = true
        const button = this.$el.querySelector(`[data-name='${item.name}']`) as HTMLDivElement
        await item.action(button, event)
      } finally {
        item.disabled = false
      }
    },
  },
})
</script>

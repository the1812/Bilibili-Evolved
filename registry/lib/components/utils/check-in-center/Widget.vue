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
import { DefaultWidget } from '@/ui'
import { CheckInItem, checkInItems } from './check-in-item'

const shouldAutoRun = (item: CheckInItem): boolean => {
  if (!item.autoRun) {
    return false
  }
  const last = new Date(item.lastRun).toDateString()
  const now = new Date().toDateString()
  return last !== now
}

export default Vue.extend({
  components: {
    DefaultWidget,
  },
  data() {
    return {
      items: checkInItems,
    }
  },
  mounted() {
    this.autoCheckIn()
  },
  methods: {
    async autoCheckIn() {
      for (const item of checkInItems) {
        if (shouldAutoRun(item)) {
          try {
            this.$set(item, 'disabled', true)
            await item.action(document.createElement('div'), new MouseEvent('click'))
          } catch (error) {
            console.error(`${item.displayName} 自动执行请求失败`, error)
          } finally {
            item.disabled = false
          }
        }
      }
    },
    async runItemAction(item: CheckInItem, event: MouseEvent) {
      try {
        // 一开始可能是 undefined
        this.$set(item, 'disabled', true)
        const button = this.$el.querySelector(`[data-name='${item.name}']`) as HTMLDivElement
        await item.action(button, event)
      } catch (error) {
        console.error(`${item.displayName} 请求失败`, error)
      } finally {
        item.disabled = false
      }
    },
  },
})
</script>

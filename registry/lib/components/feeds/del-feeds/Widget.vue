<template>
  <div ref="el" class="multiple-widgets">
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

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { DefaultWidget } from '@/ui'
import { type CheckInItem, checkInItems } from './check-in-item'

const el = ref<HTMLDivElement>(null)
const items = reactive(checkInItems)

const runItemAction = async (item: CheckInItem, event: MouseEvent) => {
  try {
    // 一开始可能是 undefined
    item.disabled = true
    const button = el.value.querySelector(`[data-name='${item.name}']`) as HTMLDivElement
    await item.action(button, event)
  } finally {
    item.disabled = false
  }
}
</script>

<template>
  <div class="dashboard-home-toolbar">
    <slot name="filters" />
    <label>
      <span>搜索</span>
      <input v-model="keyword" type="search" placeholder="标题或作者" />
    </label>
    <div v-if="$scopedSlots.actions" class="dashboard-home-library-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ value: string }>()
const emit = defineEmits<{ (event: 'input', value: string): void }>()
const keyword = computed({
  get: () => props.value,
  set: value => emit('input', value),
})
</script>

<template>
  <div class="dashboard-home-library-toolbar">
    <slot name="filters" />
    <label>
      <span>搜索</span>
      <input
        v-model="keyword"
        type="search"
        :placeholder="searchHint"
        :aria-label="`搜索${searchHint}`"
      />
    </label>
    <div v-if="$scopedSlots.actions" class="dashboard-home-library-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ value: string; searchByAuthor?: boolean }>(), {
  searchByAuthor: true,
})
const emit = defineEmits<{ (event: 'input', value: string): void }>()
const searchHint = computed(() => (props.searchByAuthor ? '标题或作者' : '标题'))
const keyword = computed({
  get: () => props.value,
  set: value => emit('input', value),
})
</script>

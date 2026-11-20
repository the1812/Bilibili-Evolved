<template>
  <div class="bili-upsearch-bar" title="搜索已关注UP（按名称）">
    <svg class="bili-upsearch-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M11.2 10.1l3.1 3.1a.8.8 0 0 1-1.1 1.1l-3.1-3.1a5.2 5.2 0 1 1 1.1-1.1zM6.9 11a4.1 4.1 0 1 0 0-8.2 4.1 4.1 0 0 0 0 8.2z"
        fill="currentColor"
      />
    </svg>
    <input
      ref="input"
      v-model="keyword"
      class="bili-upsearch-input"
      type="text"
      placeholder="搜索已关注UP"
      autocomplete="off"
      spellcheck="false"
      @input="onInput"
      @focus="emit('focus')"
    />
    <button
      class="bili-upsearch-clear"
      :class="{ show: keyword.length > 0 }"
      type="button"
      title="清空"
      aria-label="清空"
      @click="onClear"
    >
      ×
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['search', 'focus'])

const keyword = ref('')
const input = ref<HTMLInputElement | null>(null)

const onInput = () => emit('search', keyword.value)

const onClear = () => {
  keyword.value = ''
  emit('search', '')
  input.value?.focus()
}

/** 由外部在切换成功后调用, 清空输入与结果 */
const reset = () => {
  keyword.value = ''
}

defineExpose({ keyword, reset })
</script>

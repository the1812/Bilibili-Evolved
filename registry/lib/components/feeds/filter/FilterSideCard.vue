<template>
  <div class="filter-side-card-switch feeds-filter-switch">
    <button
      type="button"
      class="filter-side-card-button"
      :class="{ disabled }"
      :aria-label="`显示${name}`"
      :aria-pressed="disabled ? 'false' : 'true'"
      v-on="$listeners"
    >
      <span class="name" :class="{ disabled }">{{ name }}</span>
      <VIcon :size="16" class="disabled" icon="mdi-cancel" aria-hidden="true"></VIcon>
      <VIcon :size="16" icon="mdi-check" aria-hidden="true"></VIcon>
    </button>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { VIcon } from '@/ui'

const props = defineProps<{
  blockSideCards: number[]
  id: number
  name: string
}>()

const disabled = computed(() => props.blockSideCards.includes(props.id))
</script>

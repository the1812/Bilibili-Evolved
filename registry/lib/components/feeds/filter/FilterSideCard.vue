<template>
  <div class="filter-side-card-switch feeds-filter-switch" v-on="$listeners">
    <label :class="{ disabled }">
      <span class="name" :class="{ disabled }">{{ name }}</span>
      <VIcon :size="16" class="disabled" icon="mdi-cancel"></VIcon>
      <VIcon :size="16" icon="mdi-check"></VIcon>
    </label>
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

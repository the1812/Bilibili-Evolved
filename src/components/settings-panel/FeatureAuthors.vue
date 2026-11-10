<template>
  <div v-if="authors.length" class="feature-authors">
    <VIcon icon="mdi-account-outline" :size="16" title="作者" />
    <a
      v-for="credit in authors"
      :key="`${credit.name}:${credit.link}`"
      :href="credit.link"
      target="_blank"
      rel="noopener noreferrer"
    >
      @{{ credit.name }}
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VIcon } from '@/ui'
import { getFeatureAuthors } from '../author'
import type { Author } from '../types'

const props = defineProps<{ author?: Author | Author[] }>()
const authors = computed(() => getFeatureAuthors(props.author))
</script>

<style lang="scss">
.feature-authors {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 6px;
  font-size: 13px;
  color: var(--be-color-muted, #888);

  a {
    color: var(--theme-color);
    overflow-wrap: anywhere;
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>

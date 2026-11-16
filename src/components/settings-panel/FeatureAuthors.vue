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
@import 'common';

.feature-authors {
  @include h-center(2px);
  flex-wrap: wrap;
  color: var(--be-color-muted, #888);

  a {
    color: var(--theme-color);
    overflow-wrap: anywhere;
    text-decoration: none;
  }
}
</style>

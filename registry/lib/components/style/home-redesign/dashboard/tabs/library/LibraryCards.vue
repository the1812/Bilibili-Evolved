<template>
  <ul v-if="entries.length" class="dashboard-home-card-grid" role="list">
    <CardGridItem v-for="item in entries" :key="item.id">
      <ContentCard
        :data="item"
        :watchlater-disabled="watchlaterDisabled"
        :watchlater-action="watchlaterAction"
      />
    </CardGridItem>
  </ul>
</template>

<script setup lang="ts">
import CardGridItem from '../../shared/cards/CardGridItem.vue'
import ContentCard from '../../shared/cards/ContentCard.vue'
import type { LibraryEntry } from './library'

defineProps<{
  entries: LibraryEntry[]
  watchlaterDisabled?: boolean
  watchlaterAction?: (aid: number) => Promise<void>
}>()
</script>

<template>
  <CardCollection :dated="cardList.dated">
    <div v-if="cardList.groups.length" class="dashboard-home-card-date-groups">
      <CardDateGroup
        v-for="group in cardList.groups"
        :key="group.date"
        :date="group.date"
        :label="group.label"
      >
        <CardGridItem v-for="item in group.cards" :key="item.id">
          <ContentCard
            :data="item"
            :watchlater-disabled="watchlaterDisabled"
            :watchlater-action="watchlaterAction"
          />
        </CardGridItem>
      </CardDateGroup>
    </div>
    <slot />
  </CardCollection>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CardCollection from '../../shared/cards/CardCollection.vue'
import CardDateGroup from '../../shared/cards/CardDateGroup.vue'
import CardGridItem from '../../shared/cards/CardGridItem.vue'
import ContentCard from '../../shared/cards/ContentCard.vue'
import { getCardList } from '../../shared/cards/card-list'
import type { LibraryEntry } from './library'

const props = defineProps<{
  entries: LibraryEntry[]
  groupByDate: boolean
  watchlaterDisabled?: boolean
  watchlaterAction?: (aid: number) => Promise<void>
}>()

const cardList = computed(() =>
  getCardList(props.entries, {
    groupByDate: props.groupByDate,
    getDate: item => item.date,
  }),
)
</script>

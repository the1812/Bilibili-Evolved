<template>
  <div class="column-feeds">
    <VLoading v-if="loading"></VLoading>
    <VEmpty v-else-if="!loading && cards.length === 0"></VEmpty>
    <template v-else>
      <div class="columns-feeds-content">
        <ColumnCard v-for="c of cards" :key="c.id" :is-new="c.new" :data="c"></ColumnCard>
      </div>
      <ScrollTrigger v-if="hasMorePage" @trigger="nextPage()"></ScrollTrigger>
    </template>
  </div>
</template>
<script lang="ts">
import { feedsCardTypes } from '@/components/feeds/api'
import { isNewID } from '@/components/feeds/notify'
import { ColumnCard } from '@/components/feeds/column-card'
import ColumnCardComponent from '@/components/feeds/ColumnCard.vue'
import { nextPageMixin } from './next-page'

export default Vue.extend({
  components: {
    ColumnCard: ColumnCardComponent,
  },
  mixins: [
    nextPageMixin(feedsCardTypes.column, (card: any) => {
      const cardJson = JSON.parse(card.card)
      return {
        id: card.desc.dynamic_id_str,
        cvID: cardJson.id,
        title: cardJson.title,
        upName: cardJson.author.name,
        upFaceUrl: cardJson.author.face,
        upID: cardJson.author.mid,
        description: cardJson.summary,
        covers: cardJson.image_urls,
        originalCovers: cardJson.origin_image_urls,
        get new() {
          return isNewID(this.id)
        },
      } as ColumnCard
    }),
  ],
})
</script>
<style lang="scss">
.column-feeds {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>

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
      const article = lodash.get(card, 'modules.module_dynamic.major.article')
      const author = lodash.get(card, 'modules.module_author')
      return {
        id: card.id_str,
        cvID: article.id.toString(),
        title: article.title,
        upName: author.name,
        upFaceUrl: author.face,
        upID: author.mid,
        description: article.desc,
        covers: article.covers,
        originalCovers: article.covers,
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

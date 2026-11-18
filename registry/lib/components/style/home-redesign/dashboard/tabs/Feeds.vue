<template>
  <div class="dashboard-home-tab" :class="{ loading, loaded, error }">
    <div v-for="group in cardGroups" :key="group.date" class="dashboard-home-feed-day">
      <time
        v-if="group.date"
        class="dashboard-home-feed-date"
        :datetime="group.date"
        :title="group.date"
      >
        {{ group.label }}
      </time>
      <div class="dashboard-home-tab-cards">
        <VideoCard v-for="card in group.cards" :key="card.id" :data="card" />
      </div>
    </div>
    <VEmpty v-if="!loading && cards.length === 0" />
    <ScrollTrigger v-if="!error" ref="scrollTrigger" detect-viewport @trigger="loadCards" />
    <DashboardHomeOperations v-if="cards.length > 0" @refresh="refresh" />
  </div>
</template>
<script lang="ts">
import { getVideoFeeds } from '@/components/feeds/api'
import { VideoCard } from '@/components/feeds/video-card'
import VideoCardComponent from '@/components/feeds/VideoCard.vue'
import { formatDate } from '@/core/utils/formatters'
import { logError } from '@/core/utils/log'
import { ascendingStringSort, descendingStringSort } from '@/core/utils/sort'
import { VEmpty, ScrollTrigger } from '@/ui'
import DashboardHomeOperations from '../DashboardHomeOperations.vue'

export default Vue.extend({
  components: { ScrollTrigger, VEmpty, VideoCard: VideoCardComponent, DashboardHomeOperations },
  data() {
    return {
      loading: true,
      cards: [] as VideoCard[],
      error: false,
    }
  },
  computed: {
    cardGroups() {
      const today = new Date()
      const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
      const dateLabels = {
        [formatDate(today)]: '今天',
        [formatDate(yesterday)]: '昨天',
      }
      const cardsByDate = lodash.groupBy(this.cards, ({ time }) =>
        time && Number.isFinite(time.getTime()) ? formatDate(time) : '',
      )
      return Object.entries(cardsByDate)
        .sort(descendingStringSort(([date]) => date))
        .map(([date, cards]) => ({
          date,
          label: dateLabels[date] ?? date.slice(5).replace('-', '/'),
          cards,
        }))
    },
    loaded() {
      return !this.loading && !this.error
    },
    lastID() {
      if (!this.cards.length) {
        return null
      }
      const cards = [...this.cards]
      return cards.sort(ascendingStringSort(c => c.id))[0].id
    },
  },
  methods: {
    async loadCards() {
      try {
        this.error = false
        this.loading = true
        this.$refs.scrollTrigger.setLoadState('loading')
        this.cards = lodash.uniqBy(
          [...this.cards, ...(await getVideoFeeds('video', this.lastID))],
          it => it.id,
        )
      } catch (error) {
        logError(error)
        this.error = true
        this.$refs.scrollTrigger.setLoadState('error')
      } finally {
        this.loading = false
        if (this.loaded) {
          this.$refs.scrollTrigger.setLoadState('loaded')
        }
      }
    },
    async refresh() {
      this.cards = []
      this.$refs.scrollTrigger.resetIsFirstLoad()
    },
  },
})
</script>

<template>
  <div class="minimal-home-tab" :class="{ loading, loaded, error }">
    <div class="minimal-home-tab-cards">
      <VideoCard v-for="c of cards" :key="c.id" :data="c" />
    </div>
    <VEmpty v-if="!loading && cards.length === 0" />
    <VLoading v-if="loading && cards.length === 0" />
    <MinimalHomeOperations v-if="cards.length > 0" @refresh="loadCards" />
  </div>
</template>
<script lang="ts">
import { VideoCard } from '@/components/feeds/video-card'
import VideoCardComponent from '@/components/feeds/VideoCard.vue'
import { logError } from '@/core/utils/log'
import { ascendingStringSort } from '@/core/utils/sort'
import { VEmpty, VLoading } from '@/ui'
import { getTrendingVideos } from '../../trending'
import MinimalHomeOperations from '../MinimalHomeOperations.vue'
import { minimalHomeOptions } from '../options'

export default Vue.extend({
  components: { VLoading, VEmpty, VideoCard: VideoCardComponent, MinimalHomeOperations },
  data() {
    return {
      loading: true,
      cards: [],
      error: false,
    }
  },
  computed: {
    loaded() {
      return !this.loading && !this.error
    },
    lastID() {
      if (!this.cards.length) {
        return null
      }
      const cards: VideoCard[] = [...this.cards]
      return cards.sort(ascendingStringSort(c => c.id))[0].id
    },
  },
  async mounted() {
    this.loadCards()
  },
  methods: {
    async loadCards() {
      try {
        this.cards = []
        this.error = false
        this.loading = true
        this.cards = await getTrendingVideos(minimalHomeOptions.personalized)
      } catch (error) {
        logError(error)
        this.error = true
      } finally {
        this.loading = false
      }
    },
  },
})
</script>

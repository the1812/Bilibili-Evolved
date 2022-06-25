<template>
  <div class="minimal-home-trending" :class="{ loading, loaded, error }">
    <div class="minimal-home-trending-cards">
      <VideoCard v-for="c of cards" :key="c.id" :data="c" />
    </div>
    <VEmpty v-if="loaded && cards.length === 0" />
    <VLoading v-if="loading && cards.length === 0" />
    <MinimalHomeOperations v-if="loaded" @refresh="loadCards" />
  </div>
</template>
<script lang="ts">
import { VideoCard } from '@/components/feeds/video-card'
import VideoCardComponent from '@/components/feeds/VideoCard.vue'
import { logError } from '@/core/utils/log'
import { ascendingStringSort } from '@/core/utils/sort'
import {
  VEmpty,
  VLoading,
} from '@/ui'
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
<style lang="scss">
.minimal-home-trending {
  &-cards {
    display: grid;
    grid-template-columns: repeat(
      var(--minimal-home-card-column),
      var(--card-width)
    );
    gap: 12px;
    padding: 0 8px;
    margin-bottom: 16px;
    .video-card * {
      transition: 0.2s ease-out;
    }
  }
}
</style>

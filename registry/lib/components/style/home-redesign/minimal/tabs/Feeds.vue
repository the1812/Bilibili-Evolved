<template>
  <div class="minimal-home-tab" :class="{ loading, loaded, error }">
    <div class="minimal-home-tab-cards">
      <VideoCard v-for="c of cards" :key="c.id" :data="c" />
    </div>
    <VEmpty v-if="!loading && cards.length === 0" />
    <ScrollTrigger v-if="!error" ref="scrollTrigger" detect-viewport @trigger="loadCards" />
    <MinimalHomeOperations v-if="cards.length > 0" @refresh="refresh" />
  </div>
</template>
<script lang="ts">
import { getVideoFeeds } from '@/components/feeds/api'
import { VideoCard } from '@/components/feeds/video-card'
import VideoCardComponent from '@/components/feeds/VideoCard.vue'
import { logError } from '@/core/utils/log'
import { ascendingStringSort } from '@/core/utils/sort'
import { VEmpty, ScrollTrigger } from '@/ui'
import MinimalHomeOperations from '../MinimalHomeOperations.vue'

export default Vue.extend({
  components: { ScrollTrigger, VEmpty, VideoCard: VideoCardComponent, MinimalHomeOperations },
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

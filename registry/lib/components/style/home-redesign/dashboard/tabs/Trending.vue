<template>
  <div class="dashboard-home-tab" :class="{ loading, loaded, error }">
    <div class="dashboard-home-tab-cards">
      <VideoCard v-for="c of cards" :key="c.id" :data="c" />
    </div>
    <VEmpty v-if="!loading && cards.length === 0" />
    <VLoading v-if="loading && cards.length === 0" />
    <DashboardHomeOperations v-if="cards.length > 0" @refresh="loadCards" />
  </div>
</template>
<script lang="ts">
import VideoCardComponent from '@/components/feeds/VideoCard.vue'
import { logError } from '@/core/utils/log'
import { VEmpty, VLoading } from '@/ui'
import { getTrendingVideos } from '../../trending'
import DashboardHomeOperations from '../DashboardHomeOperations.vue'

export default Vue.extend({
  components: { VLoading, VEmpty, VideoCard: VideoCardComponent, DashboardHomeOperations },
  props: {
    personalized: Boolean,
  },
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
        this.cards = await getTrendingVideos(this.personalized)
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

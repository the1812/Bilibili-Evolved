<template>
  <div class="minimal-home-feeds" :class="{ loading, loaded, error }">
    <div class="minimal-home-feeds-cards">
      <VideoCard
        v-for="c of cards"
        :key="c.id"
        :data="c"
      />
    </div>
    <VEmpty v-if="loaded && cards.length === 0" />
    <ScrollTrigger @trigger="loadCards" />
  </div>
</template>
<script lang="ts">
import { getVideoFeeds } from '@/components/feeds/api'
import { VideoCard } from '@/components/feeds/video-card'
import VideoCardComponent from '@/components/feeds/VideoCard.vue'
import { logError } from '@/core/utils/log'
import { ascendingStringSort } from '@/core/utils/sort'
import {
  VEmpty,
  ScrollTrigger,
} from '@/ui'
import { cssVariableMixin } from '../../mixin'

export default Vue.extend({
  components: { ScrollTrigger, VEmpty, VideoCard: VideoCardComponent },
  mixins: [cssVariableMixin({

  })],
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
        this.cards = lodash.uniqBy([...this.cards, ...await getVideoFeeds('video', this.lastID)], it => it.id)
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
.minimal-home-feeds {
  &-cards {
    display: grid;
    grid-template-columns: repeat(var(--minimal-home-card-column), var(--card-width));
    gap: 12px;
    padding: 0 8px;
    margin-bottom: 16px;
    .video-card * {
      transition: .2s ease-out;
    }
  }
}
</style>

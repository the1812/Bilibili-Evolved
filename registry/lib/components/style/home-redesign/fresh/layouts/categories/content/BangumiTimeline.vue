<template>
  <div class="fresh-home-categories-bangumi-timeline-content">
    timeline
  </div>
</template>
<script lang="ts">
import { requestMixin } from './mixin'

interface TimelineSeason {
  cover: string
  delay: number
  ep_id: number
  favorites: number
  follow: number
  is_published: number
  pub_index: string
  pub_time: string
  pub_ts: number
  season_id: number
  season_status: number
  square_cover: string
  title: string
  url: string
}
interface TimelineDay {
  date: string
  date_ts: number
  day_of_week: number
  is_today: number
  seasons: TimelineSeason[]
}

export default Vue.extend({
  mixins: [requestMixin],
  props: {
    viewLastWeek: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    parseJson(json: any) {
      return json.result ?? []
    },
  },
})
</script>
<style lang="scss">
@import "common";

.fresh-home-categories-bangumi {
  &-timeline-content {

  }
}
</style>

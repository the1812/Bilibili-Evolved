<template>
  <div
    class="bangumi-category"
    :class="{'rank-loading': rank.loading, 'timeline-loading': timeline.loading}"
  >
    <bangumi-timeline
      class="timeline"
      @load="timeline.loading = false"
      @error="timeline.error = true"
    ></bangumi-timeline>
    <!-- <div class="feeds" v-if="layout === '动态'">
    </div>-->
    <rank-list :videos="rank.videos"></rank-list>
    <div class="timeline loading"></div>
    <div class="rank loading"></div>
  </div>
</template>

<script lang="ts">
export default {
  components: {
    BangumiTimeline: () => import('../bangumi-timeline.vue'),
    // SlideshowCards: () => import('../slideshow-cards.vue'),
    RankList: () => import('../rank-list.vue')
  },
  data() {
    return {
      // layout: settings.simpleHomeBangumiLayout,
      timeline: {
        error: false,
        loading: true
      },
      rank: {
        error: false,
        loading: true,
        videos: []
      }
    }
  },
  computed: {},
  methods: {
    // changeLayout(layoutName: typeof settings.simpleHomeBangumiLayout) {
    //   this.layout = settings.simpleHomeBangumiLayout = layoutName
    // }
    async loadRankList() {
      const api = `https://api.bilibili.com/pgc/web/rank/list?season_type=1&day=3`
      try {
        const json = await Ajax.getJson(api)
        if (json.code !== 0) {
          throw new Error(json.message)
        }
        const list: [] = json.result.list.map((item: any) => {
          return {
            id: item.season_id,
            href: item.url,
            coverUrl: item.new_ep.cover.replace('http:', 'https:'),
            title: item.title,
            points: item.pts,
            epTitle: item.new_ep.index_show,
            playCount: item.stat.view,
            danmakuCount: item.stat.danmaku,
            watchlater: null
          }
        })
        this.rank.videos = list.slice(0, 10)
      } catch (error) {
        logError(error)
        this.rank.error = true
      } finally {
        this.rank.loading = false
      }
    }
  },
  mounted() {
    this.loadRankList()
  }
}
</script>

<style lang="scss">
.simple-home .bangumi-category {
  display: grid;
  grid-template: 'timeline rank' 1fr / 1fr calc(1.5 * var(--rank-width) + 10px);
  grid-row-gap: 24px;
  row-gap: 24px;
  grid-column-gap: 32px;
  column-gap: 32px;
  position: relative;
  &,
  & *,
  ::after,
  ::before {
    transition: 0.2s ease-out;
  }
  .loading {
    opacity: 0;
    pointer-events: none;
    border-radius: 16px;
    position: absolute;
  }
  .rank {
    height: 700px;
  }
  @each $name in ('timeline', 'rank') {
    .#{$name} {
      grid-area: unquote($name);
    }
    &.#{$name}-loading {
      .#{$name}.loading {
        position: static;
        animation: 0.64s infinite alternate category-loading ease-in-out;
        opacity: 1;
        pointer-events: initial;
        width: 100%;
        height: 100%;
      }
      .#{$name}:not(.loading) {
        opacity: 0;
        pointer-events: none;
      }
    }
  }
}
</style>
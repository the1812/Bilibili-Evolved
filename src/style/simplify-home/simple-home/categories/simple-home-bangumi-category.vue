<template>
  <div
    class="bangumi-category"
    :class="{'rank-loading': rank.loading, 'timeline-loading': timeline.loading}"
  >
    <bangumi-timeline
      class="timeline"
      :type="timelineType"
      @load="timeline.loading = false"
      @error="timeline.error = true"
    ></bangumi-timeline>
    <!-- <div class="feeds" v-if="layout === '动态'">
    </div>-->
    <rank-list :videos="rank.videos" view-mode="bangumi" :rank-link="rankLink"></rank-list>
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
  props: ['rid'],
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
  computed: {
    timelineType() {
      // RegionCodes.bangumi === 13
      return this.rid === 13 ? 'global' : 'chinese'
    },
    rankLink() {
      return this.rid === 13 ? 'https://www.bilibili.com/ranking/bangumi/13/0/3' : 'https://www.bilibili.com/ranking/bangumi/167/0/3'
    }
  },
  watch: {
    rid() {
      this.loadRankList()
    }
  },
  methods: {
    // changeLayout(layoutName: typeof settings.simpleHomeBangumiLayout) {
    //   this.layout = settings.simpleHomeBangumiLayout = layoutName
    // }
    async loadRankList() {
      const { RegionCodes } = await import('./category-regions')
      const api =
        this.rid === RegionCodes.bangumi
          ? `https://api.bilibili.com/pgc/web/rank/list?season_type=1&day=3`
          : `https://api.bilibili.com/pgc/web/rank/list?season_type=4&day=3`
      try {
        const json = await Ajax.getJson(api)
        if (json.code !== 0) {
          throw new Error(json.message)
        }
        const list: [] = _.get(json, 'result.list', []).map((item: any) => {
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
  --total-height: 1010px;
  --rank-width: 350px;
  --rank-height: calc(var(--rank-width) / 16 * 10);
  grid-template: 'timeline rank' 1fr / 1fr var(--rank-width);
  grid-row-gap: 24px;
  row-gap: 24px;
  grid-column-gap: 32px;
  column-gap: 32px;
  position: relative;
  @for $width from 18 through 16 {
    $rank-width: #{350 + (19 - $width) * 15};
    @media screen and (min-width: #{$width * 100}px) {
      --rank-width: #{$rank-width}px;
    }
    @media screen and (min-width: #{($width - 3) * 100}px) {
      --rank-width: #{$rank-width}px;
    }
    @media screen and (min-width: #{($width - 6) * 100}px) {
      --rank-width: #{$rank-width}px;
    }
  }
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
    height: var(--total-height);
  }
  // .timeline {
  //   justify-self: center;
  // }
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
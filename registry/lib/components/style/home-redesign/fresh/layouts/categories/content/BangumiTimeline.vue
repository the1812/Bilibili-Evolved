<template>
  <div
    class="fresh-home-categories-bangumi-timeline-content"
    :class="{ loading, loaded, 'last-week': viewLastWeek }"
  >
    <div
      v-for="(item, index) of items"
      :key="item.date_ts"
      class="fresh-home-categories-bangumi-timeline-item"
      :class="{ today: index === todayIndex }"
    >
      <div class="fresh-home-categories-bangumi-timeline-date">
        <div
          class="fresh-home-categories-bangumi-timeline-date-icon"
          :class="{
            today: index === todayIndex,
            ['day-of-week-' + item.day_of_week]: true
          }"
        />
        <div class="fresh-home-categories-bangumi-timeline-date-number">
          {{ item.date }}
        </div>
        <div class="fresh-home-categories-bangumi-timeline-date-text">
          {{ dayOfWeekText(item) }}
        </div>
        <div
          v-if="index === todayIndex"
          class="fresh-home-categories-bangumi-timeline-date-today"
        >
          TODAY
        </div>
      </div>
      <div class="fresh-home-categories-bangumi-timeline-seasons">
        <div
          v-for="season of item.seasons"
          :key="season.season_id"
          class="fresh-home-categories-bangumi-timeline-season"
          :class="{ today: index === todayIndex }"
        >
          <div class="fresh-home-categories-bangumi-timeline-season-cover">
            <DpiImage
              :src="season.square_cover"
              :size="80"
            />
          </div>
          <div class="fresh-home-categories-bangumi-timeline-season-title">
            {{ season.title }}
          </div>
          <div class="fresh-home-categories-bangumi-timeline-season-episode">
            {{ getEpisode(season) }}
          </div>
          <div class="fresh-home-categories-bangumi-timeline-season-time">
            {{ season.pub_time }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { DpiImage } from '@/ui'
import { cssVariableMixin, requestMixin } from './mixin'
import { rankListCssVars } from './rank-list'

interface TimelineSeason {
  cover: string
  delay: number
  delay_id: number
  delay_index: string
  delay_reason: string
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

const rankListHeight = rankListCssVars.panelHeight - 2 * rankListCssVars.padding
export default Vue.extend({
  components: { DpiImage },
  mixins: [requestMixin, cssVariableMixin({
    rankListHeight,
  })],
  props: {
    viewLastWeek: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    todayIndex() {
      return (this.items as TimelineDay[]).findIndex(it => it.is_today === 1)
    },
    pastWeekItems() {
      return this.items.slice(0, this.todayIndex + 1)
    },
    currentWeekItems() {
      return this.items.slice(this.todayIndex)
    },
  },
  watch: {
    viewLastWeek() {
      this.updateScrollPosition()
    },
  },
  mounted() {
    this.updateScrollPosition()
  },
  methods: {
    parseJson(json: any) {
      return json.result ?? []
    },
    updateScrollPosition() {
      const element = this.$el as HTMLElement
      element.scrollTo(0, this.viewLastWeek ? 0 : rankListHeight)
    },
    getEpisode(season: TimelineSeason) {
      if (season.delay) {
        return `${season.delay_reason}: ${season.delay_index}`
      }
      return season.pub_index
    },
    dayOfWeekText(item: TimelineDay) {
      return `周${[
        '日',
        '一',
        '二',
        '三',
        '四',
        '五',
        '六',
        '日',
      ][item.day_of_week]}`
    },
  },
})
</script>
<style lang="scss">
@import "common";

.fresh-home-categories-bangumi {
  &-timeline {
    &-content {
      --season-item-width: 220px;
      --season-today-width: 250px;
      --timeline-item-height: 66px;
      --timeline-today-height: 96px;
      --timeline-viewport-items-height: calc(
        6 * var(--timeline-item-height) + var(--timeline-today-height)
      );
      --timeline-item-gap: calc(
        (var(--rank-list-height) - var(--timeline-viewport-items-height)) / 6
      );
      --timeline-viewport-height: calc(
        6 * var(--timeline-item-gap) + var(--timeline-viewport-items-height)
      );
      scroll-behavior: smooth;
      height: var(--timeline-viewport-height);
      max-height: var(--timeline-viewport-height);
      overflow: hidden;
      flex: 1;
      @include v-stretch(var(--timeline-item-gap));
    }
    &-item {
      @include h-center(24px);
      flex-shrink: 0;
      height: var(--timeline-item-height);
      &.today {
        height: var(--timeline-today-height);
      }
    }
    &-date {
      display: grid;
      flex-shrink: 0;
      grid-template: "icon number" 18px "icon text" 22px / 50px auto;
      gap: 8px;
      &-icon {
        grid-area: icon;
        justify-self: center;
        align-self: center;
        background-image: url('//s1.hdslb.com/bfs/static/bangumi-timeline/asserts/icons.png');
        filter: brightness(0.5);
        $icon-width: 50;
        $icon-height: 48;
        --scale-factor-x: calc(#{$icon-width} / 38);
        --scale-factor-y: calc(#{$icon-height} / 36);
        background-size: calc(247px * var(--scale-factor-x)) calc(663px * var(--scale-factor-y));
        width: #{$icon-width}px;
        height: #{$icon-height}px;
        background-position-x: calc(-146px * var(--scale-factor-x));
        @for $day from 1 through 7 {
          &.day-of-week-#{$day} {
            background-position-y: calc(#{-36 - 72 * ($day - 1)}px * var(--scale-factor-y));
          }
        }
        body.dark & {
          filter: none;
        }
        &.today {
          --scale-factor-x: 1;
          --scale-factor-y: 1;
          background-position-x: -56px;
          body.dark & {
            filter: invert(1);
          }
        }
      }
      &-number {
        grid-area: number;
        font-size: 12px;
        align-self: end;
        margin-bottom: -6px;
      }
      &-text {
        grid-area: text;
        @include semi-bold();
        font-size: 16px;
        align-self: start;
      }
      &-today {
        grid-column: 1 / 3;
        font-size: 12px;
        @include semi-bold();
        align-self: stretch;
        justify-self: stretch;
        @include h-center();
        justify-content: center;
        padding: 2px 0;
        color: #fff;
        background-color: var(--theme-color);
        letter-spacing: 1px;
        line-height: 1.25;
        border-radius: calc(1.25em + 4px);
      }
    }
    &-seasons {
      @include h-stretch(var(--timeline-item-gap));
      @include no-scrollbar();
      width: 0;
      flex: 1 0 0;
    }
    &-season {
      @include card(var(--home-card-radius));
      --cover-size: 50px;
      flex-shrink: 0;
      padding: 7px;
      display: grid;
      grid-template:
        "cover title title" 1.2fr
        "cover time episode" 1fr / var(--cover-size) auto 1fr;
      row-gap: 4px;
      column-gap: 12px;
      justify-content: start;
      align-content: center;
      align-items: center;
      width: var(--season-item-width);
      height: var(--timeline-item-height);

      &-cover {
        grid-area: cover;
        width: var(--cover-size);
        height: var(--cover-size);
        border-radius: 6px;
        overflow: hidden;
        img {
          width: var(--cover-size);
          height: var(--cover-size);
        }
      }
      &-title {
        grid-area: title;
        @include semi-bold();
        @include single-line();
      }
      &-episode {
        grid-area: episode;
        font-size: 12px;
        @include single-line();
      }
      &-time {
        grid-area: time;
        @include card(6px);
        @include semi-bold();
        font-size: 12px;
        padding: 2px 4px;
      }

      &.today {
        width: var(--season-today-width);
        height: var(--timeline-today-height);
        --cover-size: 80px;
        grid-template:
          "cover title title" 1.5fr
          "cover episode episode" 1fr
          "cover time ." 1fr / var(--cover-size) auto 1fr;
        row-gap: 8px;
        .fresh-home-categories-bangumi-timeline-season-cover {
          border-radius: 8px;
        }
      }
    }
  }
}
</style>

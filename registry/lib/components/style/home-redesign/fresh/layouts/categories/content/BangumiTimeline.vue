<template>
  <div
    class="fresh-home-categories-bangumi-timeline-content"
    :class="{ loading, loaded, scrolled, empty: items.length === 0 }"
  >
    <VLoading v-if="loading" />
    <VEmpty v-if="loaded && items.length === 0" />
    <div
      v-for="(item, index) of items"
      :key="item.date_ts"
      class="fresh-home-categories-bangumi-timeline-item animation"
      :class="{ today: index === todayIndex }"
    >
      <div
        v-if="item.episodes.length === 0"
        class="fresh-home-categories-bangumi-timeline-empty-background"
      ></div>
      <div class="fresh-home-categories-bangumi-timeline-date">
        <div
          class="fresh-home-categories-bangumi-timeline-date-icon"
          :class="{
            today: index === todayIndex,
            ['day-of-week-' + item.day_of_week]: true,
          }"
        />
        <div class="fresh-home-categories-bangumi-timeline-date-number">
          {{ item.date }}
        </div>
        <div class="fresh-home-categories-bangumi-timeline-date-text">
          {{ dayOfWeekText(item) }}
        </div>
        <div v-if="index === todayIndex" class="fresh-home-categories-bangumi-timeline-date-today">
          TODAY
        </div>
      </div>
      <VButton
        v-if="item.episodes.length > 0"
        icon
        type="transparent"
        title="上一页"
        @click="offsetPage(item, -1)"
      >
        <VIcon icon="left-arrow" :size="16" />
      </VButton>
      <div
        ref="seasonsList"
        :data-date="item.date"
        class="fresh-home-categories-bangumi-timeline-seasons-container scroll-top scroll-bottom"
        :class="{ 'not-empty': item.episodes.length > 0 }"
      >
        <div
          class="fresh-home-categories-bangumi-timeline-seasons"
          :class="{ today: index === todayIndex }"
        >
          <VEmpty v-if="item.episodes.length === 0" />
          <a
            v-for="season of item.episodes"
            :key="`${season.season_id}-${season.episode_id}-${season.delay_id}`"
            :data-season="season.season_id"
            :data-episode="season.episode_id"
            class="fresh-home-categories-bangumi-timeline-season"
            :class="{
              today: index === todayIndex,
              delay: Boolean(season.delay),
            }"
            target="_blank"
            :href="`https://www.bilibili.com/bangumi/play/ss${season.season_id}`"
          >
            <div
              class="fresh-home-categories-bangumi-timeline-season-cover"
              :class="{
                published: index === todayIndex && isPublished(season),
                today: index === todayIndex,
                follow: season.follow,
              }"
            >
              <DpiImage :src="season.square_cover" :size="80" />
            </div>
            <div
              class="fresh-home-categories-bangumi-timeline-season-title"
              :title="season.title"
              :class="{ today: index === todayIndex }"
            >
              {{ season.title }}
            </div>
            <div
              class="fresh-home-categories-bangumi-timeline-season-episode"
              :title="getEpisode(season)"
            >
              {{ getEpisode(season) }}
            </div>
            <div
              class="fresh-home-categories-bangumi-timeline-season-time"
              :class="{
                published: index === todayIndex && isPublished(season),
                follow: season.follow,
                today: index === todayIndex,
              }"
            >
              <div class="fresh-home-categories-bangumi-timeline-season-time-icon">
                <VIcon
                  v-if="!season.follow"
                  :icon="isPublished(season) ? 'mdi-clock-check-outline' : 'mdi-progress-clock'"
                  :size="14"
                />
                <VIcon v-else icon="mdi-heart-outline" :size="14" />
              </div>
              <div class="fresh-home-categories-bangumi-timeline-season-time-text">
                {{ season.pub_time }}
              </div>
            </div>
          </a>
        </div>
      </div>
      <VButton
        v-if="item.episodes.length > 0"
        icon
        type="transparent"
        title="下一页"
        @click="offsetPage(item, 1)"
      >
        <VIcon icon="right-arrow" :size="16" />
      </VButton>
    </div>
  </div>
</template>
<script lang="ts">
import { DpiImage, VIcon, VEmpty, VButton, VLoading } from '@/ui'
import { addComponentListener } from '@/core/settings'
import { enableHorizontalScroll } from '@/core/horizontal-scroll'
import { cssVariableMixin, requestMixin } from '../../../../mixin'
import { rankListCssVars } from './rank-list'
import { setupScrollMask, cleanUpScrollMask } from '../../../scroll-mask'
import { getJsonWithCredentials } from '@/core/ajax'

interface TimelineSeason {
  cover: string
  delay: number
  delay_id: number
  delay_index: string
  delay_reason: string
  ep_cover: string
  episode_id: number
  follow: number
  follows: number
  plays: number
  pub_index: string
  pub_time: string
  pub_ts: number
  published: number
  season_id: number
  square_cover: string
  title: string
}
interface TimelineDay {
  date: string
  date_ts: number
  day_of_week: number
  is_today: number
  episodes: TimelineSeason[]
}

const rankListHeight = rankListCssVars.panelHeight - 2 * rankListCssVars.padding
const timelineCssVars = (() => {
  const seasonItemWidth = 250
  const seasonTodayWidth = 250
  const timelineItemHeight = 82
  const timelineTodayHeight = 114
  const timelineViewportItemsHeight = 5 * timelineItemHeight + timelineTodayHeight
  const timelineItemGap = (rankListHeight - timelineViewportItemsHeight) / 5
  const timelineViewportHeight = 5 * timelineItemGap + timelineViewportItemsHeight
  return {
    seasonItemWidth,
    seasonTodayWidth,
    timelineItemHeight,
    timelineTodayHeight,
    timelineViewportItemsHeight,
    timelineItemGap,
    timelineViewportHeight,
  }
})()
export default Vue.extend({
  components: {
    DpiImage,
    VIcon,
    VEmpty,
    VLoading,
    VButton,
  },
  mixins: [
    requestMixin({ requestMethod: getJsonWithCredentials }),
    cssVariableMixin(timelineCssVars),
  ],
  data() {
    return {
      observers: [],
      now: Number(new Date()),
      timer: 0,
      scrolled: false,
    }
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
    loaded() {
      if (this.loaded) {
        this.updateScrollPosition()
      }
    },
  },
  mounted() {
    this.timer = setInterval(() => {
      this.now = Number(new Date())
    }, 60 * 1000)
    const element = this.$el as HTMLElement
    let ended = 0
    const endHandler = () => {
      ended++
      if (ended >= 7) {
        element.classList.add('snap')
        element.removeEventListener('animationend', endHandler)
      }
    }
    element.addEventListener('animationend', endHandler)
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
    const list: HTMLElement[] = this.$refs.seasonsList
    cleanUpScrollMask(...list)
  },
  methods: {
    parseJson(json: any) {
      return json.result ?? []
    },
    async updateScrollPosition() {
      await this.$nextTick()
      const list: HTMLElement[] = this.$refs.seasonsList
      let cancelAll: () => void
      addComponentListener(
        'freshHome.horizontalWheelScroll',
        (scroll: boolean) => {
          if (scroll) {
            const cancel = list
              .flatMap(it => [...it.children])
              .map(it => enableHorizontalScroll(it as HTMLElement))
            cancelAll = () => cancel.forEach(fn => fn())
          } else {
            cancelAll?.()
          }
        },
        true,
      )
      const root: HTMLElement = this.$el
      root.scrollTop = 5 * timelineCssVars.timelineItemHeight + 5 * timelineCssVars.timelineItemGap

      const classPrefix = '.fresh-home-categories-bangumi-timeline'
      list.forEach(seasons => {
        setupScrollMask({
          container: seasons,
          items: dqa(seasons, `${classPrefix}-season`) as HTMLElement[],
        })
      })
      const todaySeasons = dq(`${classPrefix}-seasons.today`)
      if (!todaySeasons) {
        return
      }
      const seasonsData: TimelineSeason[] = this.items[this.todayIndex]?.episodes
      if (seasonsData.length === 0) {
        return
      }
      const lastPublishedItem = [...seasonsData].reverse().find(it => this.isPublished(it))
      if (!lastPublishedItem) {
        this.scrolled = true
        return
      }
      const lastPublishedElement = dq(
        todaySeasons,
        `[data-season="${lastPublishedItem.season_id}"]`,
      ) as HTMLElement
      if (!lastPublishedElement) {
        return
      }
      todaySeasons.scrollLeft = lastPublishedElement.offsetLeft
      this.scrolled = true
    },
    getEpisode(season: TimelineSeason) {
      if (season.delay) {
        return `${season.delay_reason}: ${season.delay_index}`
      }
      return season.pub_index
    },
    isPublished(season: TimelineSeason) {
      if (season.delay) {
        return false
      }
      return season.pub_ts * 1000 <= this.now
    },
    dayOfWeekText(item: TimelineDay) {
      return `周${['日', '一', '二', '三', '四', '五', '六', '日'][item.day_of_week]}`
    },
    offsetPage(item: TimelineDay, offset: number) {
      const list = this.$refs.seasonsList as HTMLElement[]
      const container = list.find(it => it.dataset.date === item.date)
      const containerWidth = container.clientWidth
      const pageWidth =
        Math.trunc(containerWidth / timelineCssVars.seasonItemWidth) *
        timelineCssVars.seasonItemWidth
      const scrollArea = container.children[0]
      scrollArea?.scrollBy(offset * pageWidth, 0)
    },
  },
})
</script>
<style lang="scss">
@import 'common';
@import 'effects';

.fresh-home-categories-bangumi {
  &-timeline {
    &-content {
      @include v-stretch(var(--timeline-item-gap));
      @include no-scrollbar();
      height: var(--timeline-viewport-height);
      max-height: var(--timeline-viewport-height);
      flex: 1;
      .be-empty,
      .be-loading {
        align-self: center;
      }
      &.empty,
      &.loading {
        flex: 1;
        border: 2px dashed #8884;
        border-radius: var(--home-card-radius);
      }
      &.snap {
        scroll-snap-type: y mandatory;
      }
      &.scrolled {
        .animation {
          animation-play-state: running;
        }
      }
    }
    @function slides($index) {
      @return calc(-10 * $index * $index / 9 + 40 * $index / 3 + 24);
    }
    @for $index from 6 through 12 {
      &-item:nth-child(#{$index}) {
        @include item-slides-y(#{slides($index)}px);
        animation-delay: #{calc((1 - (slides($index) - 24) / 40) * 0.2)}s;
      }
    }
    &-item {
      @include h-center(4px);
      @include border-card();
      scroll-snap-align: start;
      overflow: hidden;
      padding: 0 4px 0 16px;
      position: relative;
      flex-shrink: 0;
      height: var(--timeline-item-height);
      &.today {
        height: var(--timeline-today-height);
      }
    }
    &-date {
      display: grid;
      flex-shrink: 0;
      margin-right: 8px;
      grid-template: 'icon number' 18px 'icon text' 22px / 50px auto;
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
        color: var(--foreground-color);
        background-color: var(--theme-color);
        letter-spacing: 1px;
        line-height: 1.25;
        border-radius: calc(1.25em + 4px);
      }
    }
    &-seasons-container {
      @include h-stretch();
      body:not(.dark) & {
        @include scroll-mask-x(18px, #fdfdfd);
      }
      body.dark & {
        @include scroll-mask-x(18px, #222);
      }
      width: 0;
      flex: 1 0 0;
      margin: 0 2px;
      position: relative;
    }
    &-seasons {
      @include h-stretch(calc(var(--timeline-item-gap) / 2));
      @include no-scrollbar();
      overscroll-behavior: initial;
      width: 0;
      flex: 1 0 0;
      scroll-snap-type: x mandatory;
    }
    &-season {
      --cover-size: 56px;
      scroll-snap-align: start;
      flex-shrink: 0;
      padding: 7px;
      display: grid;
      grid-template:
        'cover title title' 1.2fr
        'cover time episode' 1fr / var(--cover-size) auto 1fr;
      row-gap: 4px;
      column-gap: 12px;
      justify-content: start;
      align-content: center;
      align-items: center;
      width: var(--season-item-width);
      // height: var(--timeline-item-height);
      transition: 0.2s ease-out;
      &:not(:last-child) {
        padding-right: calc(var(--timeline-item-gap) / 2 + 6px);
        // border-right: 1px solid #e8e8e8;
      }

      &-cover {
        grid-area: cover;
        width: var(--cover-size);
        height: var(--cover-size);
        box-shadow: 0 0 0 1px #8882;
        border-radius: 10px;
        overflow: hidden;
        img {
          width: var(--cover-size);
          height: var(--cover-size);
          transition: 0.2s ease-out;
        }
        &.follow {
          box-shadow: 0 0 0 2px var(--theme-color);
        }
        &.today {
          border-radius: 12px;
          &.follow.published {
            box-shadow: 0 0 0 2px var(--theme-color), 0 0 0 5px var(--theme-color-20);
          }
        }
      }
      &-title {
        grid-area: title;
        transition: color 0.2s ease-out;
        @include semi-bold();
        @include single-line();
        &.today {
          @include max-line(2, 1.3);
        }
      }
      &-episode {
        grid-area: episode;
        font-size: 12px;
        @include single-line();
        opacity: 0.64;
      }
      &-time {
        grid-area: time;
        @include card();
        @include round-bar(20);
        @include h-center(4px);
        box-shadow: none;
        padding: 2px 6px 2px 4px;
        &.published {
          border-color: var(--theme-color);
          &.follow {
            background-color: var(--theme-color);
            color: var(--foreground-color);
          }
        }
        &-text {
          @include semi-bold();
          font-size: 11px;
        }
        &.follow:not(.published) &-icon {
          color: var(--theme-color);
        }
        &.today {
          transform: translateX(-2px);
        }
      }

      &:hover &-title {
        color: var(--theme-color) !important;
      }
      &:hover &-cover img {
        transform: scale(1.05);
      }

      &.today {
        width: var(--season-today-width);
        // height: var(--timeline-today-height);
        --cover-size: 84px;
        grid-template:
          'cover title title' 2fr
          'cover episode episode' 1fr
          'cover time .' auto / var(--cover-size) auto 1fr;
        row-gap: 4px;
      }
      &.delay {
        opacity: 0.5;
        &:hover {
          opacity: 1;
        }
      }
    }
    &-empty-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        45deg,
        transparent 25%,
        #8882 0,
        #8882 50%,
        transparent 0,
        transparent 75%,
        #8882 0,
        #8882 100%
      );
      background-size: 60px 60px;
    }
  }
}
</style>

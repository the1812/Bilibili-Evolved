<template>
  <div class="bangumi-timeline-container">
    <div class="area-header">时间表</div>
    <div class="bangumi-timeline">
      <div class="timeline-day" v-for="t of timeline" :key="t.date">
        <div class="date-container" :class="{today: t.isToday}" @click="moveTimeline">
          <div class="icon" :class="['day-of-week-' + t.dayOfWeek]"></div>
          <div class="date">{{t.date}}</div>
          <div class="day-of-week">{{t.dayOfWeekText}}</div>
        </div>
        <div class="empty-day" :class="{alt: t.isToday}" v-if="Object.entries(t.bangumis).length === 0"></div>
        <div
          class="time-container"
          v-for="[time, bangumis] of Object.entries(t.bangumis)"
          :key="time"
        >
          <div class="time" :class="{'recent': t.isToday && recentTime.includes(time)}">
            <icon type="mdi" icon="clock-fast"></icon>
            {{time}}
          </div>
          <a
            class="bangumi-item"
            v-for="b of bangumis"
            :key="b.url"
            :class="{delay: b.delay}"
            :href="b.url"
            target="_blank"
          >
            <div class="cover-container">
              <dpi-img :size="72" :src="b.squareCoverUrl"></dpi-img>
            </div>
            <div class="title">{{b.title}}</div>
            <div class="ep-title">
              <icon type="mdi" icon="heart-outline" title="已追番" v-if="b.follow"></icon>
              {{b.epTitle}}
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
interface Timeline {
  date: string
  dayOfWeek: number
  dayOfWeekText: string
  isToday: boolean
  bangumis: {
    [time: string]: {
      coverUrl: string
      squareCoverUrl: string
      time: string
      timestamp: number
      url: string
      follow: boolean
      epTitle: string
      title: string
      delay: boolean
      published: boolean
    }[]
  }
}
const apiMapping: { [key: string]: string | undefined } = {
  global: 'https://bangumi.bilibili.com/web_api/timeline_global',
  chinese: 'https://bangumi.bilibili.com/web_api/timeline_cn'
}
export default {
  components: {
    Icon: () => import('../../icon.vue'),
    DpiImg: () => import('../../dpi-img.vue')
  },
  props: {
    type: {
      type: String,
      default: 'global',
      required: false
    }
  },
  data() {
    return {
      timeline: [],
      recentTime: ''
    }
  },
  computed: {
    apiUrl() {
      return apiMapping[this.type] || apiMapping.global
    }
  },
  watch: {
    type() {
      this.updateTimeline()
    }
  },
  methods: {
    calculateRecentTime() {
      const today = (this.timeline as Timeline[]).find(it => it.isToday)!
      const now = Number(new Date())
      const timestamps = Object.entries(today.bangumis).map(
        ([time, bangumis]) => {
          return { time, timestamp: bangumis[0].timestamp, bangumis }
        }
      )
      if (timestamps.length === 0) {
        return
      }
      const recentTimestamps = timestamps.filter(it => it.timestamp < now)
      // .pop()
      if (recentTimestamps.length === 0) {
        this.recentTime = [timestamps[0].time] // 没有更早的时间就取下一个即将更新的时间
      } else {
        this.recentTime = recentTimestamps.map(it => it.time)
      }
      // console.log(this.recentTime)
    },
    moveTimeline(e: MouseEvent) {
      const dateElement = e.currentTarget as HTMLElement
      const dayElement = dateElement.parentElement!
      const timelineElement = dayElement.parentElement!
      const style = getComputedStyle(timelineElement)
      const width =
        parseInt(style.getPropertyValue('--column-width').match(/(.+)px/)![1]) +
        parseInt(style.getPropertyValue('--column-gap').match(/(.+)px/)![1])
      const offset = dayElement.offsetLeft - timelineElement.scrollLeft
      if (offset < width) {
        timelineElement.scrollLeft -= width
      } else if (offset >= width * 2) {
        timelineElement.scrollLeft += width
      }
      console.log(e, dateElement, dayElement, timelineElement)
      console.log(
        width,
        width * 2,
        dayElement.offsetLeft,
        timelineElement.scrollLeft,
        offset
      )
    },
    async updateTimeline() {
      try {
        const json = await Ajax.getJsonWithCredentials(this.apiUrl)
        if (json.code !== 0) {
          throw new Error(json.message)
        }
        const results = (json.result as any[]).map(item => {
          return {
            date: item.date,
            dayOfWeek: item.day_of_week,
            dayOfWeekText:
              '周' +
              [
                ,
                // undefined for index 0
                '一',
                '二',
                '三',
                '四',
                '五',
                '六',
                '日'
              ][item.day_of_week],
            isToday: Boolean(item.is_today),
            bangumis: _.groupBy(
              (item.seasons as any[]).map(s => {
                return {
                  coverUrl: s.cover.replace('http:', 'https:'),
                  squareCoverUrl: s.square_cover.replace('http:', 'https:'),
                  time: s.pub_time,
                  timestamp: s.pub_ts * 1000,
                  url: s.url,
                  follow: Boolean(s.follow),
                  epTitle: s.pub_index || s.delay_reason + ' ' + s.delay_index,
                  title: s.title,
                  delay: Boolean(s.delay),
                  published: Boolean(s.is_published)
                }
              }),
              it => it.time
            )
          }
        })
        // console.log(_.cloneDeep(results))
        this.timeline = results
        this.calculateRecentTime()
        setInterval(() => {
          if (document.hasFocus()) {
            this.calculateRecentTime()
          }
        }, 60 * 1000)
        await this.$nextTick()
        const el = this.$el as HTMLElement
        const timeline = this.$el.querySelector(
          '.bangumi-timeline'
        ) as HTMLElement
        const style = getComputedStyle(timeline)
        const oldWidth = parseInt(
          style.getPropertyValue('--column-width').match(/(.+)px/)![1]
        )
        const gap = parseInt(
          style.getPropertyValue('--column-gap').match(/(.+)px/)![1]
        )
        // const count = parseInt(style.getPropertyValue('--column-count'))
        // const width = (el.clientWidth - gap * (count - 1)) / 3
        // timeline.style.setProperty('--column-width', `${width}px`)
        timeline.scrollLeft = 5 * (oldWidth + gap) // 第7个是今日
        // console.log(width, count, gap, 5 * (width + gap))
        // const recentBangumi = timeline.querySelector(
        //   '.time.recent'
        // ) as HTMLElement
        // recentBangumi.scrollIntoView()
      } catch (error) {
        logError(error)
        this.$emit('error')
      } finally {
        this.$emit('load')
      }
    }
  },
  async mounted() {
    await this.updateTimeline()
  }
}
</script>

<style lang="scss">
.simple-home .bangumi-timeline-container {
  width: 100%;
  .bangumi-timeline {
    @mixin no-scrollbar {
      scrollbar-width: none !important;
      &::-webkit-scrollbar {
        height: 0 !important;
        width: 0 !important;
      }
    }
    display: flex;
    align-items: flex-start;
    overflow: auto;
    @include no-scrollbar();
    scroll-behavior: smooth;
    // scroll-snap-type: x mandatory;

    --column-count: 1;
    --column-width: 250px;
    --column-gap: 24px;
    width: calc(
      var(--column-count) * (var(--column-width) + var(--column-gap)) - 0.5 *
        var(--column-gap)
    );
    .timeline-day {
      scroll-snap-align: start;
      width: var(--column-width);
      max-height: calc(var(--total-height) - 32px);
      overflow: auto;
      flex: 0 0 auto;
      padding-bottom: 16px;
      // overscroll-behavior-y: contain;
      scroll-behavior: smooth;
      @include no-scrollbar();
      .date-container {
        display: grid;
        grid-template:
          'icon date' 1fr
          'icon dow' 1fr / auto 1fr;
        grid-column-gap: 8px;
        column-gap: 8px;
        height: 60px;
        padding-bottom: 12px;
        cursor: pointer;
        position: sticky;
        top: 0;
        z-index: 1;
        background-color: #f4f4f4;
        body.dark & {
          background-color: #181818;
        }
        .icon {
          grid-area: icon;
          justify-self: center;
          align-self: center;
          background-image: url('//s1.hdslb.com/bfs/static/bangumi-timeline/asserts/icons.png');
          background-size: 247px 663px;
          width: 38px;
          height: 36px;
          background-position-x: -146px;
          filter: brightness(0.5);
          @for $day from 1 through 7 {
            &.day-of-week-#{$day} {
              background-position-y: #{-36 - 72 * ($day - 1)}px;
            }
          }
        }
        .date {
          grid-area: date;
          align-self: end;
          opacity: 0.75;
        }
        .day-of-week {
          grid-area: dow;
          align-self: start;
          font-weight: bold;
          font-size: 15px;
          opacity: 0.75;
        }
        &.today {
          .icon {
            width: 50px;
            height: 48px;
            background-position-x: -56px;
            filter: none;
          }
          .date {
            font-size: 14px;
            opacity: 1;
          }
          .day-of-week {
            font-size: 18px;
            opacity: 1;
          }
        }
        body.dark & {
          .icon {
            filter: brightness(0.8);
          }
          &.today .icon {
            filter: invert(1);
          }
        }
      }
      .empty-day {
        margin-top: 26px;
        width: 246px;
        height: 469px;
        background: url('//s1.hdslb.com/bfs/static/bangumi-timeline/asserts/empty-1.png') no-repeat;
        &.alt {
          background: url('//s1.hdslb.com/bfs/static/bangumi-timeline/asserts/empty-2.png') no-repeat;
        }
      }
      .time-container {
        margin-top: 18px;
        & > :not(:last-child) {
          margin-bottom: 8px;
        }
        .time {
          display: flex;
          align-items: center;
          font-weight: bold;
          &.recent {
            color: var(--theme-color);
            & ~ .bangumi-item {
              box-shadow: 0 4px 8px 0 #0001,
                inset 0 0px 0px 2px var(--theme-color);
              .cover-container {
                margin: 2px;
                border-radius: 6px 0 0 6px;
              }
            }
          }
          .be-icon {
            margin-right: 6px;
            font-size: 18px;
          }
        }
        .bangumi-item {
          display: grid;
          $cover-size: 72px;
          height: $cover-size;
          grid-template:
            'cover title' auto
            'cover ep' auto / $cover-size 1fr;
          background-color: #fff;
          color: inherit;
          box-shadow: 0 4px 8px 0 #0001;
          border-radius: 8px;
          grid-row-gap: 8px;
          row-gap: 8px;
          body.dark & {
            background-color: #282828;
          }
          .cover-container {
            grid-area: cover;
            overflow: hidden;
            border-radius: 8px 0 0 8px;
            img {
              width: 100%;
              height: 100%;
            }
          }
          &.delay {
            opacity: 0.4;
          }
          &.delay:hover {
            opacity: 1;
          }
          &:hover {
            color: var(--theme-color) !important;
            .cover-container img {
              transform: scale(1.05);
            }
          }
          .title {
            grid-area: title;
            align-self: end;
            font-size: 13px;
            font-weight: bold;
            margin: 0 12px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            max-height: 2.6em;
            word-break: break-all;
            line-height: 1.3;
            overflow: hidden;
          }
          .ep-title {
            grid-area: ep;
            align-self: start;
            margin: 0 12px;
            display: flex;
            align-items: center;
            white-space: no-wrap;
            overflow: hidden;
            .be-icon {
              color: var(--theme-color);
              margin-right: 4px;
              font-size: 18px;
              line-height: 1;
            }
          }
        }
      }
      &:not(:last-child) {
        margin-right: var(--column-gap);
      }
    }
    @media screen and (min-width: 1000px) {
      --column-count: 2;
    }
    @media screen and (min-width: 1300px) {
      --column-count: 3;
    }
    @media screen and (min-width: 1550px) {
      --column-count: 4;
    }
  }
}
</style>
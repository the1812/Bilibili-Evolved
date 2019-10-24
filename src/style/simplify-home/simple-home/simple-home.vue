<template>
  <div class="simple-home">
    <div class="blackboards">
      <div class="header">
        <div class="title">活动</div>
        <div class="more">
          <icon type="mdi" icon="dots-horizontal"></icon>更多
        </div>
      </div>
      <input
        class="hidden-input blackboard-radio"
        type="radio"
        name="blackboard"
        v-for="(b, i) of blackboards"
        :checked="i === 0"
        :id="'blackboard' + i"
        :data-index="i"
        :key="i"
      />
      <div class="jump-dots">
        <label v-for="(b, i) of blackboards" :for="'blackboard' + i" :key="i">
          <div class="jump-dot"></div>
        </label>
      </div>
      <div class="blackboard-cards">
        <a
          class="blackboard-card"
          target="_blank"
          v-for="(b, i) of blackboards"
          :key="i"
          :href="b.url"
          :title="b.title"
        >
          <img :src="b.imageUrl" :alt="b.title" />
          <div class="title">{{b.title}}</div>
        </a>
      </div>
    </div>
    <div class="trendings">
      <div class="header">
        <div class="title">热门</div>
        <div class="tabs">
          <div
            class="tab"
            v-for="tab in tabs"
            :key="tab.day"
            @click="currentTab = tab"
            :class="{active: currentTab === tab}"
          >
            <div class="tab-name">{{tab.name}}</div>
          </div>
        </div>
      </div>
      <div class="contents">
        <div class="card-wrapper" v-for="card in trendingCards" :key="card.id">
          <video-card :data="card" orientation="vertical"></video-card>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Blackboard } from './blackboard'
interface Tab {
  name: string
  day: number
}
const tabs: Tab[] = [
  {
    name: '一周',
    day: 7
  },
  {
    name: '三日',
    day: 3
  },
  {
    name: '昨日',
    day: 1
  }
]
export default {
  components: {
    Icon: () => import('../../icon.vue'),
    VideoCard: () => import('../video-card.vue')
  },
  data() {
    return {
      blackboards: [] as Blackboard[],
      tabs,
      currentTab: tabs[0],
      interval: 0,
      trendingCards: []
    }
  },
  methods: {
    async updateTrendingTab(tab: Tab) {
      const { getTrendingVideos } = await import('../trending-videos')
      this.trendingCards = await getTrendingVideos(tab.day)
    }
  },
  watch: {
    currentTab(tab: Tab) {
      this.updateTrendingTab(tab)
    }
  },
  destroyed() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  },
  async mounted() {
    this.updateTrendingTab(this.currentTab)
    const { getBlackboards } = await import('./blackboard')
    this.blackboards = (await getBlackboards()).filter(it => !it.isAd)
    const blackboards = dq('.blackboards') as HTMLDivElement
    this.interval = setInterval(() => {
      if (!document.hasFocus() || blackboards.matches('.blackboards:hover')) {
        return
      }
      const currentIndex = parseInt(
        dq(`.blackboard-radio:checked`)!.getAttribute('data-index')!
      )
      let targetIndex: number
      if (currentIndex === this.blackboards.length - 1) {
        targetIndex = 0
      } else {
        targetIndex = currentIndex + 1
      }
      ;(dq(
        `.blackboard-radio[data-index='${targetIndex}']`
      ) as HTMLInputElement).checked = true
    }, 5000)
  }
}
</script>
<style lang="scss">
.simple-home {
  --title-color: black;
  color: #444;
  display: grid;
  grid-template-areas: 'blackboards trendings' 'info info' 'categories categories';
  grid-template-columns: repeat(2, auto);
  grid-template-rows: repeat(3, auto);
  column-gap: 52px;
  row-gap: 32px;
  @media screen and (max-width: 900px) {
    & {
      grid-template-areas: 'blackboards' 'trendings' 'info' 'categories';
      grid-template-columns: 1fr;
      grid-template-rows: repeat(4, auto);
    }
  }
  &,
  & * {
    transition: 0.2s ease-out;
  }
  body.dark & {
    --title-color: white;
    color: #ddd;
  }
  .jump-dots {
    grid-area: dots;
    align-self: center;
    justify-self: center;
    & label {
      display: block;
    }
    & label:not(:last-child) {
      margin-bottom: 6px;
    }
    .jump-dot {
      background-color: #ddd;
      width: 8px;
      height: 20px;
      border-radius: 8px;
      cursor: pointer;
      body.dark & {
        background-color: #444;
      }
    }
  }
  .hidden-input {
    display: none;
    @for $i from 1 to 16 {
      &:checked:nth-of-type(#{$i})
        ~ .jump-dots
        label:nth-child(#{$i})
        .jump-dot {
        background-color: var(--theme-color);
        height: 40px;
      }
      &:checked:nth-of-type(#{$i}) ~ .blackboard-cards .blackboard-card {
        transform: translateY(calc(-1 * #{$i - 1} * var(--blackboard-height)));
      }
    }
  }
  .more {
    background-color: #ddd;
    cursor: pointer;
    padding: 2px 16px 2px 8px;
    display: flex;
    align-items: center;
    border-radius: 16px;
    font-size: 14px;
    .be-icon {
      margin-right: 8px;
      transition: 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    &:hover {
      .be-icon {
        transform: rotate(180deg);
      }
    }
    body.dark & {
      background-color: #333;
    }
  }

  $first-row-height: 250px;
  .blackboards {
    grid-area: blackboards;
    display: grid;
    grid-template-areas: 'header header' 'dots cards';
    grid-template-columns: 8px 1fr;
    grid-template-rows: 1fr $first-row-height;
    row-gap: 16px;
    column-gap: 16px;
    align-self: start;
    justify-self: center;

    .header {
      grid-area: header;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .title {
        color: var(--title-color);
        font-weight: bold;
        font-size: 24px;
      }
    }
    .blackboard-cards {
      grid-area: cards;
      --blackboard-width: 500px;
      --blackboard-height: 250px;
      width: var(--blackboard-width);
      height: var(--blackboard-height);
      border-radius: 16px;
      overflow: hidden;
      .blackboard-card {
        width: 100%;
        height: 100%;
        position: relative;
        display: block;
        transition: 0.3s cubic-bezier(0.65, 0.05, 0.36, 1);
        img {
          width: 100%;
          height: 100%;
          object-fit: fill;
          display: block;
        }
        .title {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          padding: 4px 16px;
          color: white;
          background-color: #000a;
          font-size: 14px;
          font-weight: bold;
          border-radius: 14px;
          white-space: nowrap;
        }
      }
    }
  }

  .trendings {
    grid-area: trendings;
    display: flex;
    flex-direction: column;
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 8px;
      .title {
        color: var(--title-color);
        font-weight: bold;
        font-size: 24px;
      }
      .tabs {
        display: flex;
        align-items: center;
        .tab {
          cursor: pointer;
          position: relative;
          .tab-name {
            opacity: 0.5;
            font-size: 14px;
          }
          &:not(:last-child) {
            margin-right: 24px;
          }
          &::after {
            content: '';
            width: calc(80%);
            height: 3px;
            border-radius: 2px;
            position: absolute;
            background-color: var(--theme-color);
            left: 10%;
            bottom: -6px;
            transform: scaleX(0);
            transition: 0.2s ease-out;
          }
          &.active::after {
            transform: scaleX(1);
          }
          &.active .tab-name {
            font-weight: bold;
            opacity: 1;
            transform: scale(1.1);
          }
        }
      }
    }
    .contents {
      --card-width: 200px;
      --card-height: 250px;
      --card-count: 3;
      margin-top: 16px;
      display: flex;
      overflow: auto;
      height: calc(var(--card-height) + 16px);
      width: calc((var(--card-width) + 16px) * var(--card-count));
      scroll-snap-type: x mandatory;
      scrollbar-width: none !important;

      @media screen and (max-width: 1250px) and (min-width: 900px) {
        & {
          --card-count: 2;
        }
      }
      @media screen and (max-width: 1050px) and (min-width: 900px) {
        & {
          --card-count: 1;
        }
      }
      @media screen and (min-width: 1600px) {
        & {
          --card-count: 4;
        }
      }
      @media screen and (min-width: 1900px) {
        & {
          --card-count: 5;
        }
      }
      &::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
      }
      .card-wrapper {
        padding: 0 8px;
        scroll-snap-align: start;
        flex-shrink: 0;
      }
    }
  }
}
</style>
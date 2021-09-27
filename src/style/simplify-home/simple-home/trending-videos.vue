<template>
  <div class="trendings">
    <div class="header">
      <div class="title">{{ trendingTitle }}</div>
      <!-- <div class="tabs">
        <div
          class="tab"
          v-for="tab in tabs"
          :key="tab.day"
          @click="changeTab(tab)"
          :class="{active: currentTab === tab}"
        >
          <div class="tab-name">{{tab.name}}</div>
        </div>
      </div>-->
      <div class="page">
        <div v-if="personalized" class="refresh" @click="refreshCards">
          <icon type="mdi" icon="refresh"></icon>
        </div>
        <div class="prev-page" @click="scroll(-1)">
          <icon type="extended" icon="left-arrow"></icon>
        </div>
        <div class="next-page" @click="scroll(1)">
          <icon type="extended" icon="right-arrow"></icon>
        </div>
      </div>
    </div>
    <div class="contents edge-gradient" ref="contents" @scroll="checkScrollPosition" :class="{ 'is-bottom': isBottom }">
      <div class="card-wrapper" v-for="card in trendingCards" :key="card.id">
        <video-card :data="card" orientation="vertical"></video-card>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { VideoCardInfo } from '../video-card-info'

export default {
  components: {
    VideoCard: () => import('../video-card.vue'),
    Icon: () => import('../../icon.vue'),
  },
  data() {
    const personalized = getUID() && settings.simpleHomePersonalized
    return {
      personalized,
      isBottom: false,
      trendingTitle: personalized ? '推荐' : '热门',
      trendingCards: [] as VideoCardInfo[],
    }
  },
  methods: {
    async refreshCards() {
      const { getTrendingVideos } = await import('../trending-videos')
      this.trendingCards = await getTrendingVideos()
    },
    scroll(orientation: number) {
      const contents = this.$refs.contents as HTMLElement
      const style = getComputedStyle(contents)
      const count = parseFloat(style.getPropertyValue('--card-count'))
      const width = parseFloat(style.getPropertyValue('--card-width'))
      const gap = 16
      const distance = count * (width + gap)
      contents.scrollBy(orientation * distance, 0)
    },
    checkScrollPosition: _.debounce(function checkScrollPosition(e: Event) {
      const element = e.target as HTMLElement
      this.isBottom = element.scrollWidth - element.scrollLeft === element.clientWidth
    }, 200),
  },
  async created() {
    await this.refreshCards()
  },
  async mounted() {
    let cancelHorizontalScroll: () => void
    addSettingsListener('simpleHomeWheelScroll', async (value: boolean) => {
      if (value) {
        const contents = this.$refs.contents as HTMLElement
        const { enableHorizontalScroll } = await import('../../../utils/horizontal-scroll')
        cancelHorizontalScroll = enableHorizontalScroll(contents)
      } else {
        cancelHorizontalScroll && cancelHorizontalScroll()
      }
    }, true)

    // 等内容上去了再添加 snap 特性, 不然不知道为啥会错位
    const contents = this.$refs.contents as HTMLElement
    await SpinQuery.condition(() => contents, () => contents.childElementCount > 0)
    resources.applyImportantStyleFromText(`
      .simple-home.snap .trendings .contents {
        scroll-snap-type: x mandatory;
      }
    `, 'trending-videos-snap-fix')
  },
}
</script>

<style lang="scss">
.simple-home {
  .trendings {
    display: flex;
    flex-direction: column;
    .header {
      padding: 0 8px;
      .page {
        display: flex;
        align-items: center;
        > * {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          background-color: #8882;
          border-radius: 50%;
          margin-left: 8px;
          cursor: pointer;
          &:hover {
            background-color: #8884;
          }
        }
        .prev-page .be-icon {
          transform: translateX(-1px);
        }
        .next-page .be-icon {
          transform: translateX(1px);
        }
        .refresh .be-icon {
          transition-duration: .5s;
          transform: scale(0.9);
        }
        .refresh:hover .be-icon {
          transform: scale(0.9) rotate(360deg);
        }
      }
    }
    .contents {
      --card-width: 200px;
      --card-height: 250px;
      --card-count: 4;
      margin-top: 16px;
      display: flex;
      overflow: auto;
      height: calc(var(--card-height) + 16px);
      width: calc((var(--card-width) + 16px) * var(--card-count));
      scrollbar-width: none !important;

      @media screen and (max-width: 1300px) and (min-width: 900px) {
        & {
          --card-count: 3;
        }
      }
      @media screen and (max-width: 1100px) and (min-width: 900px) {
        & {
          --card-count: 5;
        }
      }
      @media screen and (min-width: 1550px) {
        & {
          --card-count: 5;
        }
      }
      @media screen and (min-width: 1850px) {
        & {
          --card-count: 6;
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
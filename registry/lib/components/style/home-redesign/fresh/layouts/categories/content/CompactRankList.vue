<template>
  <div
    class="fresh-home-compact-rank-list scroll-top scroll-bottom"
    :class="{ loading, loaded, 'not-empty': items.length > 0 }"
  >
    <div v-if="!loaded" class="fresh-home-compact-rank-list-loading-container">
      <VLoading v-if="loading" />
      <div
        v-if="(error || items.length === 0) && !loading"
        class="fresh-home-compact-rank-list-empty"
      >
        <VEmpty />
        <VButton class="fresh-home-compact-rank-list-refresh-button" round @click="reload">
          <VIcon icon="mdi-refresh" />
          刷新
        </VButton>
      </div>
    </div>
    <div v-if="loaded" ref="content" class="fresh-home-compact-rank-list-content">
      <a
        v-for="(video, index) of items"
        :key="video.id"
        ref="cards"
        class="compact-rank-list-card"
        :href="video.videoHref"
        target="_blank"
      >
        <div class="compact-rank-list-card-cover">
          <div class="compact-rank-list-card-rank" :class="{ 'top-three': index < 3 }">
            {{ index + 1 }}
          </div>
          <DpiImage :src="video.coverUrl" :size="{ width: 128, height: 80 }" />
        </div>
        <div class="compact-rank-list-card-info">
          <div class="compact-rank-list-card-title" :title="video.title">{{ video.title }}</div>
          <UpInfo :up-face-url="video.upFaceUrl" :href="video.upHref" :up-name="video.upName">
            <template #fallback-icon>
              <VIcon v-bind="upInfoProps" />
            </template>
          </UpInfo>
          <div class="compact-rank-list-card-stats">
            <VIcon icon="mdi-fire" :size="16" />
            {{ video.points | formatCount }}
            <VIcon icon="play" :size="16" />
            {{ video.playCount | formatCount }}
          </div>
        </div>
      </a>
    </div>
  </div>
</template>
<script lang="ts">
import UpInfo from '@/components/feeds/UpInfo.vue'
import { formatCount } from '@/core/utils/formatters'
import { VIcon, VLoading, VEmpty, VButton, DpiImage } from '@/ui'
import { cssVariableMixin, requestMixin } from '../../../../mixin'
import { cleanUpScrollMask, setupScrollMask } from '../../../scroll-mask'
import { compactRankListCssVars } from './rank-list'

export default Vue.extend({
  components: {
    DpiImage,
    UpInfo,
    VIcon,
    VLoading,
    VEmpty,
    VButton,
  },
  filters: {
    formatCount,
  },
  mixins: [requestMixin(), cssVariableMixin(compactRankListCssVars)],
  props: {
    parseJson: {
      type: Function,
      required: true,
    },
    bangumiMode: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    upInfoProps() {
      return {
        size: 18,
        icon: this.bangumiMode ? 'mdi-television-classic' : 'up-outline',
        style: {
          transform: this.bangumiMode ? 'translateY(-1px)' : 'none',
        },
      }
    },
  },
  watch: {
    loaded() {
      if (this.loaded) {
        this.setupIntersection()
      }
    },
  },
  beforeDestroy() {
    cleanUpScrollMask(this.$el)
  },
  methods: {
    async setupIntersection() {
      await this.$nextTick()
      console.log(this.$refs.cards)
      setupScrollMask({
        container: this.$el,
        items: this.$refs.cards,
      })
    },
  },
})
</script>
<style lang="scss">
@import 'common';
@import 'effects';
@import './rank-list';

.fresh-home-compact-rank-list {
  @include rank-list-common();
  @include v-stretch();
  @include scroll-mask-y(8px, var(--home-base-color));
  width: var(--panel-width);
  height: var(--panel-height);
  min-height: var(--panel-height);
  padding: var(--padding);
  margin: calc(0px - var(--padding));
  position: relative;

  &-content {
    height: 0;
    flex: 1 0 0;
    @include v-stretch(12px);
    @include no-scrollbar();
  }
  &.not-empty &-content {
    scroll-snap-type: y mandatory;
  }
  .compact-rank-list-card {
    scroll-snap-align: start;
    cursor: pointer;
    @include h-center(8px);
    &-cover {
      @include card(12px);
      flex-shrink: 0;
      display: flex;
      align-self: center;
      box-shadow: none;
      overflow: hidden;
      transform-origin: bottom;
      position: relative;
      img {
        transition: 0.2s ease-out;
      }
      &:hover img {
        transform: scale(1.05);
      }
    }
    &-rank {
      @include h-center();
      justify-content: center;
      z-index: 10;
      position: absolute;
      bottom: 4px;
      left: 4px;
      font-size: 12px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: #333;
      color: #eee;
      @include semi-bold();
      &.top-three {
        background-color: var(--theme-color);
        color: var(--foreground-color);
      }
    }
    &-info {
      @include v-stretch(6px);
      flex: 1 0 0;
      width: 0;
    }
    &-title {
      line-height: 1.5;
      transition: color 0.2s ease-out;
      @include semi-bold();
      @include single-line();
      &:hover {
        color: var(--theme-color);
      }
    }
    &-stats {
      @include h-center(12px);
      font-size: 12px;
      opacity: 0.5;
      .be-icon {
        margin-right: -8px;
      }
    }
  }
}
</style>

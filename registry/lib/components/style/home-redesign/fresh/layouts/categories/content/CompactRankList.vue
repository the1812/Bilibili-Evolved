<template>
  <div class="fresh-home-compact-rank-list" :class="{ loading, loaded }">
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
    <template v-if="loaded">
      <div v-for="(video, index) of items" :key="video.id" class="compact-rank-list-card">
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
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import UpInfo from '@/components/feeds/UpInfo.vue'
import { formatCount } from '@/core/utils/formatters'
import { VIcon, VLoading, VEmpty, VButton, DpiImage } from '@/ui'
import { cssVariableMixin, requestMixin } from '../../../../mixin'
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
})
</script>
<style lang="scss">
@import 'common';
@import './rank-list';

.fresh-home-compact-rank-list {
  @include v-stretch();
  width: var(--panel-width);
  height: var(--panel-height);
  min-height: var(--panel-height);
  padding: var(--padding);
  margin: calc(0px - var(--padding));

  @include rank-list-common();

  .compact-rank-list-card {
    @include h-center(8px);
    &-cover {
      @include card(12px);
      flex-shrink: 0;
      cursor: pointer;
      display: flex;
      align-self: center;
      box-shadow: none;
      overflow: hidden;
      transform-origin: bottom;
      transition: 0.2s ease-out;
      position: relative;
      img {
        transition: 0.2s ease-out;
      }
      &:hover img {
        transform: scale(1.05);
      }
      &:hover {
        transform: scale(1.025);
      }
    }
    &-rank {
      @include h-center();
      justify-content: center;
      z-index: 10;
      position: absolute;
      top: 4px;
      left: 4px;
      font-size: 12px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: #333;
      color: #eee;
      font-weight: bold;
      &.top-three {
        background-color: var(--theme-color);
        color: var(--foreground-color);
      }
    }
    &-info {
      @include v-stretch(6px);
    }
    &-title {
      line-height: 1.5;
      @include semi-bold();
      @include single-line();
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
  &.loaded {
    @include v-stretch(12px);
  }
}
</style>

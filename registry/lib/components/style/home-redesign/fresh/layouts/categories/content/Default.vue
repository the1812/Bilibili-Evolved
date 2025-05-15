<template>
  <div class="fresh-home-categories-default">
    <div class="fresh-home-categories-default-video-column">
      <div class="fresh-home-categories-default-video-column-item">
        <SubHeader> 有新动态 </SubHeader>
        <VideoSlides :api="activeVideosApi" />
      </div>
      <div class="fresh-home-categories-default-video-column-item">
        <SubHeader> 最新发布 </SubHeader>
        <VideoSlides :api="newVideosApi" />
      </div>
    </div>
    <div class="fresh-home-categories-default-rank-list">
      <div class="fresh-home-categories-default-rank-list-header">
        <a :href="rankingsLink" target="_blank">
          <SubHeader> 排行榜 </SubHeader>
        </a>
        <VButton v-if="isCompactRankList" icon title="显示较少项目" @click="toggleRankListMode">
          <VIcon icon="mdi-poll" :size="16" />
        </VButton>
        <VButton v-else icon title="显示较多项目" @click="toggleRankListMode">
          <VIcon icon="mdi-format-list-text" :size="16" />
        </VButton>
      </div>
      <CompactRankList
        v-if="isCompactRankList"
        :bangumi-mode="isPGC"
        :parse-json="parseJson"
        :api="rankingsApi"
      />
      <RankList v-else :bangumi-mode="isPGC" :parse-json="parseJson" :api="rankingsApi" />
    </div>
  </div>
</template>
<script lang="ts">
import { VButton, VIcon } from '@/ui'
import { applyContentFilter } from '@/components/feeds/api'
import { getBangumiRankListCards, getDefaultRankListCards, PGCSeasonTypeMap } from './rank-list'
import CompactRankList from './CompactRankList.vue'
import RankList from './RankList.vue'
import VideoSlides from './VideoSlides.vue'
import SubHeader from '../../../SubHeader.vue'
import { compactRankListMixin } from '../../../../mixin'
import { categoryCodesV2 } from '@/components/utils/categories/data'

export default Vue.extend({
  components: {
    CompactRankList,
    RankList,
    VideoSlides,
    SubHeader,
    VButton,
    VIcon,
  },
  mixins: [compactRankListMixin()],
  props: {
    region: {
      type: Object,
      required: true,
    },
  },
  data() {
    const regionCode = this.region.id
    const tidV2 = categoryCodesV2[this.region.category.route]
    const isPGC = Object.keys(PGCSeasonTypeMap).includes(this.region.category.route)
    console.log({
      category: this.region.category,
      tidV2,
      isPGC,
    })
    return {
      isPGC,
      activeVideosApi: `https://api.bilibili.com/x/web-interface/dynamic/region?ps=10&rid=${regionCode}`,
      newVideosApi: `https://api.bilibili.com/x/web-interface/newlist?ps=10&rid=${regionCode}`,
      rankingsApi: isPGC
        ? `https://api.bilibili.com/pgc/season/rank/web/list?day=3&season_type=${
            PGCSeasonTypeMap[this.region.category.route]
          }`
        : `https://api.bilibili.com/x/web-interface/ranking/v2?rid=${tidV2}&type=all`,
      rankingsLink: `https://www.bilibili.com/v/popular/rank/${this.region.category.route}`,
    }
  },
  methods: {
    parseJson(json: any) {
      const allCards = this.isPGC ? getBangumiRankListCards(json) : getDefaultRankListCards(json)
      const cards = allCards.slice(0, 10)
      return applyContentFilter(cards)
    },
  },
})
</script>
<style lang="scss">
@import 'common';

.fresh-home-categories-default {
  @include h-stretch(var(--fresh-home-categories-column-gap));

  &-video-column {
    @include v-stretch(16px);
    flex: 1;
    &-item {
      @include v-stretch(var(--fresh-home-categories-header-gap));
    }
  }
  &-rank-list {
    @include v-stretch(var(--fresh-home-categories-header-gap));
    &-header {
      @include h-center();
      justify-content: space-between;
      position: relative;
      .be-button {
        @include absolute-v-center();
        right: 0;
      }
      .be-icon {
        margin: 1px;
      }
    }
  }
}
</style>

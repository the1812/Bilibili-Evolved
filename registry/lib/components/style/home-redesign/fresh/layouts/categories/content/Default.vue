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
      <CompactRankList v-if="isCompactRankList" :parse-json="parseJson" :api="rankingsApi" />
      <RankList v-else :parse-json="parseJson" :api="rankingsApi" />
    </div>
  </div>
</template>
<script lang="ts">
import { VButton, VIcon } from '@/ui'
import { applyContentFilter } from '@/components/feeds/api'
import { RankListCard } from './rank-list'
import CompactRankList from './CompactRankList.vue'
import RankList from './RankList.vue'
import VideoSlides from './VideoSlides.vue'
import SubHeader from '../../../SubHeader.vue'
import { compactRankListMixin } from '../../../../mixin'

/*
TODO: 有几个区表面上是普通视频, 但内容走的还是番剧那套, 所以 RankList 也要换 API
视频排行: `https://api.bilibili.com/x/web-interface/ranking/region?day=3&original=0&rid=${regionCode}`
番剧排行: `https://api.bilibili.com/pgc/season/rank/web/list?day=3&season_type=${seasonType}`
- seasonType: 1 番剧 2 电影 3 纪录片 4 国创 5 电视剧
*/

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
    console.log(this.region.category)
    return {
      activeVideosApi: `https://api.bilibili.com/x/web-interface/dynamic/region?ps=10&rid=${regionCode}`,
      newVideosApi: `https://api.bilibili.com/x/web-interface/newlist?ps=10&rid=${regionCode}`,
      rankingsApi: `https://api.bilibili.com/x/web-interface/ranking/region?rid=${regionCode}&day=3&original=0`,
      rankingsLink: `https://www.bilibili.com/v/popular/rank/${this.region.category.route}`,
    }
  },
  methods: {
    parseJson(json: any) {
      const items = (lodash.get(json, 'data', []) || []) as any[]
      const cards = items
        .map(
          (item): RankListCard => ({
            id: item.aid,
            title: item.title,
            playCount: item.play,
            points: item.pts,
            upHref: `https://space.bilibili.com/${item.mid}`,
            upName: item.author,
            dynamic: item.description,
            coverUrl: item.pic,
            videoHref: `https://www.bilibili.com/video/${item.bvid}`,
          }),
        )
        .slice(0, 10)
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

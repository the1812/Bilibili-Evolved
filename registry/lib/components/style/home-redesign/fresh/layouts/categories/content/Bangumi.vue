<template>
  <div class="fresh-home-categories-bangumi">
    <div class="fresh-home-categories-bangumi-timeline">
      <div class="fresh-home-categories-bangumi-timeline-header">
        <SubHeader> 时间表 </SubHeader>
      </div>
      <BangumiTimeline :api="timelineApi" />
    </div>
    <div class="fresh-home-categories-bangumi-rank-list">
      <div class="fresh-home-categories-bangumi-rank-list-header">
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
      <RankList v-else bangumi-mode :parse-json="parseJson" :api="rankingsApi" />
    </div>
  </div>
</template>
<script lang="ts">
import { VButton, VIcon } from '@/ui'
import { applyContentFilter } from '@/components/feeds/api'
import SubHeader from '../../../SubHeader.vue'
import RankList from './RankList.vue'
import CompactRankList from './CompactRankList.vue'
import BangumiTimeline from './BangumiTimeline.vue'
import { RankListCard } from './rank-list'
import { compactRankListMixin } from '../../../../mixin'

const bangumiDataMap = {
  anime: {
    seasonType: 1,
    rankingName: 'bangumi',
  },
  guochuang: {
    seasonType: 4,
    // 你永远不知道"国创"在 b 站代码里有多少种叫法...
    rankingName: 'guochan',
  },
}
export default Vue.extend({
  components: {
    SubHeader,
    BangumiTimeline,
    RankList,
    CompactRankList,
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
    const { route } = this.region.category
    const { rankingName, seasonType } = bangumiDataMap[route]
    return {
      bangumiDataMap,
      route,
      timelineApi: `https://api.bilibili.com/pgc/web/timeline?types=${seasonType}&before=6&after=6`,
      rankingsApi: `https://api.bilibili.com/pgc/season/rank/web/list?day=3&season_type=${seasonType}`,
      rankingsLink: `https://www.bilibili.com/v/popular/rank/${rankingName}`,
    }
  },
  methods: {
    parseJson(json: any) {
      const items = (json.data?.list ?? []) as any[]
      const cards = items
        .map((item): RankListCard => {
          const upName = item.new_ep?.index_show ?? item.title
          return {
            id: item.season_id,
            title: item.title,
            playCount: item.stat.view,
            points: item.stat.follow,
            upHref: item.url,
            upName,
            dynamic: upName,
            coverUrl: item.new_ep?.cover ?? item.ss_horizontal_cover,
            videoHref: item.url,
          }
        })
        .slice(0, 10)
      return applyContentFilter(cards)
    },
  },
})
</script>
<style lang="scss">
@import 'common';
@import 'effects';

.fresh-home-categories-bangumi {
  @include h-stretch(var(--fresh-home-categories-column-gap));

  &-timeline {
    flex: 1;
    @include v-stretch(var(--fresh-home-categories-header-gap));
    &-down {
      &:hover .be-icon {
        @include bounce-y(2);
      }
      &:active .be-icon {
        transform: scale(0.9);
      }
    }
    &-up {
      &:hover .be-icon {
        @include bounce-y(-2);
      }
      &:active .be-icon {
        transform: scale(0.9);
      }
    }
    &-header {
      @include h-center();
      height: 26px;
      justify-content: space-between;
    }
  }
  &-rank-list {
    @include v-stretch(var(--fresh-home-categories-header-gap));
    &-header {
      @include h-center();
      justify-content: space-between;
      .be-icon {
        margin: 1px;
      }
    }
  }
}
</style>

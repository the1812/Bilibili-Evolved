<template>
  <div class="fresh-home-categories-bangumi">
    <div class="fresh-home-categories-bangumi-timeline">
      <div class="fresh-home-categories-bangumi-timeline-header">
        <SubHeader>
          时间表
        </SubHeader>
        <!-- <VButton
          v-if="viewLastWeek"
          class="fresh-home-header-icon-button fresh-home-categories-bangumi-timeline-down"
          round
          @click="verticalScroll(false)"
        >
          <VIcon icon="mdi-arrow-down" :size="20" />
          本周
        </VButton>
        <VButton
          v-else
          class="fresh-home-header-icon-button fresh-home-categories-bangumi-timeline-up"
          round
          @click="verticalScroll(true)"
        >
          <VIcon icon="mdi-arrow-up" :size="20" />
          上周
        </VButton> -->
      </div>
      <BangumiTimeline
        :view-last-week="viewLastWeek"
        :api="timelineApi"
      />
    </div>
    <div class="fresh-home-categories-bangumi-rank-list">
      <a
        class="fresh-home-categories-bangumi-rank-list-header"
        :href="rankingsLink"
        target="_blank"
      >
        <SubHeader>
          排行榜
        </SubHeader>
      </a>
      <RankList
        bangumi-mode
        :parse-json="parseJson"
        :api="rankingsApi"
      />
    </div>
  </div>
</template>
<script lang="ts">
import {
  VButton,
  VIcon,
} from '@/ui'
import SubHeader from '../../../SubHeader.vue'
import RankList from './RankList.vue'
import BangumiTimeline from './BangumiTimeline.vue'
import { RankListCard } from './rank-list'

const bangumiDataMap = {
  anime: {
    timeline: 'global',
    seasonType: 1,
    rankingName: 'bangumi',
  },
  guochuang: {
    timeline: 'cn',
    seasonType: 4,
    // 你永远不知道"国创"在 b 站代码里有多少种叫法...
    rankingName: 'guochan',
  },
}
export default Vue.extend({
  components: {
    SubHeader,
    VButton,
    VIcon,
    BangumiTimeline,
    RankList,
  },
  props: {
    region: {
      type: Object,
      required: true,
    },
  },
  data() {
    const { route } = this.region.category
    const { rankingName, seasonType, timeline } = bangumiDataMap[route]
    return {
      viewLastWeek: false,
      bangumiDataMap,
      route,
      timelineApi: `https://bangumi.bilibili.com/web_api/timeline_${timeline}`,
      rankingsApi: `https://api.bilibili.com/pgc/season/rank/web/list?day=3&season_type=${seasonType}`,
      rankingsLink: `https://www.bilibili.com/v/popular/rank/${rankingName}`,
    }
  },
  methods: {
    verticalScroll(goUp: boolean) {
      this.viewLastWeek = goUp
    },
    parseJson(json: any) {
      const items = (json.data?.list ?? []) as any[]
      return items
        .map(
          (item): RankListCard => ({
            id: item.season_id,
            title: item.title,
            playCount: item.stat.view,
            points: item.pts,
            upHref: item.url,
            upName: item.new_ep?.index_show ?? item.title,
            coverUrl: item.new_ep?.cover ?? item.ss_horizontal_cover,
            videoHref: item.url,
          }),
        )
        .slice(0, 10)
    },
  },
})
</script>
<style lang="scss">
@import "common";
@import "./effects";

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
      justify-content: space-between;
    }
  }
  &-rank-list {
    @include v-stretch(var(--fresh-home-categories-header-gap));
    // &-header {
    //   // Timeline 的 header 中, 图标为 20px, 上下 padding 共 8px, 这里的 line-height 需要保持一致来对齐
    //   line-height: calc(20px + 8px);
    // }
  }
}
</style>

<template>
  <div class="fresh-home-categories-default">
    <div class="fresh-home-categories-default-video-column">
      <div class="fresh-home-categories-default-video-column-item">
        <SubHeader> 有新动态 </SubHeader>
        <VideoSlides :api="activeVideoSource.api" :parse-json="activeVideoSource.parseJson" />
      </div>
      <div class="fresh-home-categories-default-video-column-item">
        <SubHeader> 更多推荐 </SubHeader>
        <VideoSlides :api="newVideoSource.api" :parse-json="newVideoSource.parseJson" />
      </div>
    </div>
    <div class="fresh-home-categories-default-rank-list">
      <div class="fresh-home-categories-default-rank-list-header">
        <a :href="rankingSource.link" target="_blank">
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
        :bangumi-mode="rankingSource.bangumiMode"
        :parse-json="rankingSource.parseJson"
        :api="rankingSource.api"
      />
      <RankList
        v-else
        :bangumi-mode="rankingSource.bangumiMode"
        :parse-json="rankingSource.parseJson"
        :api="rankingSource.api"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { VButton, VIcon } from '@/ui'
import { applyContentFilter } from '@/components/feeds/api'
import { formatDuration } from '@/core/utils/formatters'
import { getBangumiRankListCards, getDefaultRankListCards, PGCSeasonTypeMap } from './rank-list'
import CompactRankList from './CompactRankList.vue'
import RankList from './RankList.vue'
import VideoSlides from './VideoSlides.vue'
import SubHeader from '../../../SubHeader.vue'
import { compactRankListMixin } from '../../../../mixin'

const pgcFeedRoutes = ['movie', 'tv', 'documentary', 'variety']

const parsePgcVideos = (json: any) => {
  const cards = json.items.map((item: any) => ({
    id: item.episode_id,
    videoHref: item.link,
    coverUrl: item.cover,
    title: item.title,
    epTitle: item.sub_title,
    description: item.sub_title,
    // PGC 季卡片不提供时长/弹幕/点赞, 只有评分和播放
    rating: item.rating || undefined,
    playCount: item.stat.view,
  }))
  return applyContentFilter(cards)
}
const parseRegionVideos = (json: any) => {
  const cards = json.archives.map((item: any) => ({
    id: item.aid,
    aid: item.aid,
    bvid: item.bvid,
    videoHref: `https://www.bilibili.com/video/${item.bvid}/`,
    coverUrl: item.cover,
    title: item.title,
    upName: item.author.name,
    upID: item.author.mid,
    playCount: item.stat.view,
    danmakuCount: item.stat.danmaku,
    like: item.stat.like,
    description: item.rec_reason,
    duration: item.duration,
    durationText: formatDuration(item.duration),
  }))
  return applyContentFilter(cards)
}
// 游标过大时综艺列表会枯竭 (实测 220 起不足、230 起全空), 上限收到 200
const pgcFeedSource = (route: string) => ({
  api: `https://api.bilibili.com/pgc/page/web/feed?name=${route}&coursor=${lodash.random(
    24,
    200,
  )}&new_cursor_status=true`,
  parseJson: parsePgcVideos,
})
const rcmdSource = (regionId: number, displayId: number) => ({
  api: `https://api.bilibili.com/x/web-interface/region/feed/rcmd?display_id=${displayId}&request_cnt=15&from_region=${regionId}`,
  parseJson: parseRegionVideos,
})

const getVideoSource = (route: string, regionId: number, displayId: number) =>
  pgcFeedRoutes.includes(route) ? pgcFeedSource(route) : rcmdSource(regionId, displayId)
const getRankingSource = (route: string, regionId: number) => {
  const seasonType = PGCSeasonTypeMap[route]
  const bangumiMode = seasonType !== undefined
  const getRankListCards = bangumiMode ? getBangumiRankListCards : getDefaultRankListCards
  return {
    api: bangumiMode
      ? `https://api.bilibili.com/pgc/season/rank/web/list?day=3&season_type=${seasonType}`
      : `https://api.bilibili.com/x/web-interface/ranking/v2?rid=${regionId}&type=all`,
    link: `https://www.bilibili.com/v/popular/rank/${route}`,
    bangumiMode,
    parseJson: (json: any) => applyContentFilter(getRankListCards(json).slice(0, 10)),
  }
}

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
    const regionId = this.region.id
    const { route } = this.region.category
    return {
      activeVideoSource: getVideoSource(route, regionId, 1),
      newVideoSource: getVideoSource(route, regionId, 2),
      rankingSource: getRankingSource(route, regionId),
    }
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

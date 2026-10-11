<template>
  <div class="fresh-home-categories-default">
    <div class="fresh-home-categories-default-video-column">
      <div class="fresh-home-categories-default-video-column-item">
        <SubHeader> 有新动态 </SubHeader>
        <VideoSlides :api="activeVideoSource.api" :parse-json="activeVideoSource.parseJson" />
      </div>
      <div class="fresh-home-categories-default-video-column-item">
        <SubHeader> {{ newVideoSource.label }} </SubHeader>
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
// 频道对应的旧版分区 tid, 用于「最新发布」
const newlistTids: Record<string, number> = {
  cinephile: 181,
  ent: 5,
  music: 3,
  dance: 129,
  douga: 1,
  kichiku: 119,
  game: 4,
  knowledge: 36,
  tech: 188,
  fashion: 155,
  food: 211,
  vlog: 160,
}

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
const parseNewVideos = (json: any) => {
  const cards = json.archives.map((item: any) => ({
    id: item.aid,
    aid: item.aid,
    bvid: item.bvid,
    videoHref: `https://www.bilibili.com/video/${item.bvid}/`,
    coverUrl: item.pic,
    title: item.title,
    upName: item.owner.name,
    upFaceUrl: item.owner.face,
    upID: item.owner.mid,
    playCount: item.stat.view,
    danmakuCount: item.stat.danmaku,
    like: item.stat.like,
    coins: item.stat.coin,
    description: item.desc,
    dynamic: item.dynamic || item.desc,
    type: item.tname,
    duration: item.duration,
    durationText: formatDuration(item.duration),
  }))
  return applyContentFilter(cards)
}
const parseDefaultRankings = (json: any) =>
  applyContentFilter(getDefaultRankListCards(json).slice(0, 10))
const parsePgcRankings = (json: any) =>
  applyContentFilter(getBangumiRankListCards(json).slice(0, 10))
// 游标过大时综艺列表会枯竭 (实测 220 起不足、230 起全空), 上限收到 200
const pgcFeedSource = (route: string, label?: string) => ({
  api: `https://api.bilibili.com/pgc/page/web/feed?name=${route}&coursor=${lodash.random(
    24,
    200,
  )}&new_cursor_status=true`,
  parseJson: parsePgcVideos,
  label,
})
const newlistSource = (tid: number) => ({
  api: `https://api.bilibili.com/x/web-interface/newlist?ps=10&rid=${tid}`,
  parseJson: parseNewVideos,
  label: '最新发布',
})
const rcmdSource = (regionId: number, displayId: number, label?: string) => ({
  api: `https://api.bilibili.com/x/web-interface/region/feed/rcmd?display_id=${displayId}&request_cnt=15&from_region=${regionId}`,
  parseJson: parseRegionVideos,
  label,
})

const getActiveVideoSource = (route: string, regionId: number) =>
  pgcFeedRoutes.includes(route) ? pgcFeedSource(route) : rcmdSource(regionId, 1)
const getNewVideoSource = (route: string, regionId: number) => {
  const newlistTid = pgcFeedRoutes.includes(route) ? regionId : newlistTids[route]
  if (newlistTid) {
    return newlistSource(newlistTid)
  }
  // 综艺没有 newlist 数据, 换个游标再取一次 pgc feed
  return pgcFeedRoutes.includes(route)
    ? pgcFeedSource(route, '更多推荐')
    : rcmdSource(regionId, 2, '更多推荐')
}
const getRankingSource = (route: string, regionId: number) => {
  const seasonType = PGCSeasonTypeMap[route]
  const bangumiMode = seasonType !== undefined
  return {
    api: bangumiMode
      ? `https://api.bilibili.com/pgc/season/rank/web/list?day=3&season_type=${seasonType}`
      : `https://api.bilibili.com/x/web-interface/ranking/v2?rid=${regionId}&type=all`,
    link: `https://www.bilibili.com/v/popular/rank/${route}`,
    bangumiMode,
    parseJson: bangumiMode ? parsePgcRankings : parseDefaultRankings,
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
      activeVideoSource: getActiveVideoSource(route, regionId),
      newVideoSource: getNewVideoSource(route, regionId),
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

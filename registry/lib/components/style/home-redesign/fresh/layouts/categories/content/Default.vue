<template>
  <div class="fresh-home-categories-default">
    <div class="fresh-home-categories-default-video-column">
      <div class="fresh-home-categories-default-video-column-item">
        <SubHeader> 有新动态 </SubHeader>
        <VideoSlides :api="activeVideoSource.api" :parse-json="activeVideoSource.parseJson" />
      </div>
      <div class="fresh-home-categories-default-video-column-item">
        <SubHeader> 最新发布 </SubHeader>
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
import { categoryCodesV2 } from '@/components/utils/categories/data'

const regionFeedCodes: Record<string, number> = {
  cinephile: 1001,
  ent: 1002,
  music: 1003,
  dance: 1004,
  douga: 1005,
  kichiku: 1007,
  game: 1008,
  knowledge: 1010,
  tech: 1012,
  car: 1013,
  fashion: 1014,
  sports: 1018,
  food: 1020,
  animal: 1024,
  life: 1029,
}
const pgcFeedNames: Record<string, string> = {
  movie: 'movie',
  tv: 'tv',
  documentary: 'documentary',
}

const parsePgcVideos = (json: any) => {
  const cards = json.items.map((item: any) => ({
    id: item.episode_id,
    videoHref: item.link,
    coverUrl: item.cover,
    title: item.title,
    epTitle: item.sub_title,
    description: item.sub_title,
    duration: item.stat.duration,
    durationText: formatDuration(item.stat.duration),
    playCount: item.stat.view,
    danmakuCount: item.stat.danmaku,
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

const getActiveVideoSource = (route: string) => {
  const pgcFeedName = pgcFeedNames[route]
  if (pgcFeedName) {
    return {
      api: `https://api.bilibili.com/pgc/page/web/feed?name=${pgcFeedName}&coursor=${lodash.random(
        24,
        300,
      )}&new_cursor_status=true`,
      parseJson: parsePgcVideos,
    }
  }
  return {
    api: `https://api.bilibili.com/x/web-interface/region/feed/rcmd?display_id=1&request_cnt=15&from_region=${regionFeedCodes[route]}`,
    parseJson: parseRegionVideos,
  }
}
const getRankingSource = (route: string) => {
  const seasonType = PGCSeasonTypeMap[route]
  const bangumiMode = seasonType !== undefined
  return {
    api: bangumiMode
      ? `https://api.bilibili.com/pgc/season/rank/web/list?day=3&season_type=${seasonType}`
      : `https://api.bilibili.com/x/web-interface/ranking/v2?rid=${categoryCodesV2[route]}&type=all`,
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
    const regionCode = this.region.id
    const { route } = this.region.category
    return {
      activeVideoSource: getActiveVideoSource(route),
      newVideoSource: {
        api: `https://api.bilibili.com/x/web-interface/newlist?ps=10&rid=${regionCode}`,
        parseJson: parseNewVideos,
      },
      rankingSource: getRankingSource(route),
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

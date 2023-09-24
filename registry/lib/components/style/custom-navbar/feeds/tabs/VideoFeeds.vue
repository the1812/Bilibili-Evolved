<template>
  <div class="video-feeds">
    <VLoading v-if="loading"></VLoading>
    <VEmpty v-else-if="!loading && cards.length === 0"></VEmpty>
    <template v-else>
      <div class="video-feeds-content">
        <transition-group name="cards" tag="div" class="left-column">
          <VideoCard
            v-for="c of columnedCards.left"
            :key="c.id"
            orientation="vertical"
            :is-new="c.new"
            :show-stats="false"
            :data="c"
          ></VideoCard>
        </transition-group>
        <transition-group name="cards" tag="div" class="right-column">
          <VideoCard
            v-for="c of columnedCards.right"
            :key="c.id"
            orientation="vertical"
            :is-new="c.new"
            :show-stats="false"
            :data="c"
          ></VideoCard>
        </transition-group>
      </div>
      <ScrollTrigger v-if="hasMorePage" @trigger="nextPage()"></ScrollTrigger>
    </template>
  </div>
</template>
<script lang="ts">
import { VideoCard } from '@/components/feeds/video-card'
import { formatDuration, formatCount, parseDuration, parseCount } from '@/core/utils/formatters'
import { isNewID } from '@/components/feeds/notify'
import { feedsCardTypes, groupVideoFeeds } from '@/components/feeds/api'
import VideoCardComponent from '@/components/feeds/VideoCard.vue'
import { nextPageMixin } from './next-page'

const formatPubTime = (pubTime: number) => {
  const now = Number(new Date())
  const pubDate = new Date(pubTime)
  const time = [pubDate.getHours(), pubDate.getMinutes(), pubDate.getSeconds()]
    .map(it => it.toString().padStart(2, '0'))
    .join(':')
  let date: number[]
  if (new Date(now).getFullYear() !== pubDate.getFullYear()) {
    date = [pubDate.getFullYear(), pubDate.getMonth() + 1, pubDate.getDate()]
  } else {
    date = [pubDate.getMonth() + 1, pubDate.getDate()]
  }
  return `${date.map(it => it.toString().padStart(2, '0')).join('-')} ${time}`
}
const formatPubTimeText = (pubTime: number) => {
  const now = Number(new Date())
  const oneDayBefore = now - 1000 * 3600 * 24
  if (oneDayBefore < pubTime) {
    const diffHours = Math.round((now - pubTime) / 1000 / 3600)
    if (diffHours === 0) {
      const diffMinutes = Math.round((now - pubTime) / 1000 / 60)
      if (diffMinutes === 0) {
        return '刚刚'
      }
      return `${diffMinutes}分钟前`
    }
    return `${diffHours}小时前`
  }
  const pubDate = new Date(pubTime)
  let date: number[]
  if (new Date(now).getFullYear() !== pubDate.getFullYear()) {
    date = [pubDate.getFullYear(), pubDate.getMonth() + 1, pubDate.getDate()]
  } else {
    date = [pubDate.getMonth() + 1, pubDate.getDate()]
  }
  return `${date.map(it => it.toString().padStart(2, '0')).join('-')}`
}
export default Vue.extend({
  components: {
    VideoCard: VideoCardComponent,
  },
  mixins: [
    nextPageMixin(feedsCardTypes.video, (card: any) => {
      const archive = lodash.get(card, 'modules.module_dynamic.major.archive')
      const author = lodash.get(card, 'modules.module_author')
      return {
        id: card.id_str,
        aid: parseInt(archive.aid),
        bvid: archive.bvid,
        videoUrl: `https://www.bilibili.com/${archive.bvid}`,
        coverUrl: archive.cover,
        title: archive.title,
        duration: parseDuration(archive.duration_text),
        durationText: formatDuration(parseDuration(archive.duration_text)),
        description: archive.desc,
        pubTime: formatPubTime(author.pub_ts * 1000),
        pubTimeText: formatPubTimeText(author.pub_ts * 1000),
        upFaceUrl: author.face,
        upName: author.name,
        upID: author.mid,
        watchlater: true,
        playCount: formatCount(parseCount(archive.stat.play)),
        get new() {
          return isNewID(this.id)
        },
      } as VideoCard
    }),
  ],
  computed: {
    columnedCards() {
      const { cards } = this as { cards: VideoCard[] }
      return {
        left: cards.filter((_, index) => index % 2 === 0),
        right: cards.filter((_, index) => index % 2 !== 0),
      }
    },
  },
  methods: {
    onCardsUpdate(cards: VideoCard[]) {
      return groupVideoFeeds(cards)
    },
  },
})
</script>
<style lang="scss" scoped>
.video-feeds {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  flex: 1;
  padding: 0 8px;
  .be-scroll-trigger {
    padding-bottom: 12px;
  }
  &-content {
    flex: 1;
    align-self: stretch;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    width: 356px;
    .cards {
      &-enter,
      &-leave-to {
        opacity: 0;
        transform: translateY(-16px) scale(0.9);
      }
      &-leave-active {
        transition: 0.24s cubic-bezier(0.22, 0.61, 0.36, 1);
        position: absolute;
      }
    }
    .left-column,
    .right-column {
      display: flex;
      flex-direction: column;
      padding-bottom: 12px;
      .video-card {
        // width: 174px;
        --card-width: 174px;
        &:not(:last-child) {
          margin-bottom: 8px;
        }
      }
    }
  }
}
</style>

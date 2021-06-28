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
import { formatDuration, formatCount } from '@/core/utils/formatters'
import { isNewID } from '@/components/feeds/notify'
import { feedsCardTypes, groupVideoFeeds } from '@/components/feeds/api'
import VideoCardComponent from '@/components/feeds/VideoCard.vue'
import { nextPageMixin } from './next-page'

export default Vue.extend({
  components: {
    VideoCard: VideoCardComponent,
  },
  mixins: [
    nextPageMixin(feedsCardTypes.video, (card: any) => {
      const cardJson = JSON.parse(card.card)
      return {
        id: card.desc.dynamic_id_str,
        aid: cardJson.aid,
        coverUrl: cardJson.pic,
        title: cardJson.title,
        duration: cardJson.duration,
        durationText: formatDuration(cardJson.duration),
        description: cardJson.desc,
        videoUrl: `https://www.bilibili.com/av${cardJson.aid}`,
        upFaceUrl: card.desc.user_profile.info.face,
        upName: card.desc.user_profile.info.uname,
        upID: card.desc.user_profile.info.uid,
        watchlater: true,
        playCount: formatCount(cardJson.stat.view),
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
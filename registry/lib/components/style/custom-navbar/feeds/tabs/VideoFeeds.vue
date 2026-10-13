<template>
  <VideoCardList
    :cards="cards"
    :loading="loading"
    :has-more-page="hasMorePage"
    @next-page="nextPage"
  />
</template>
<script lang="ts">
import { VideoCard } from '@/components/feeds/video-card'
import { formatDuration, formatCount, parseDuration, parseCount } from '@/core/utils/formatters'
import { isNewID } from '@/components/feeds/notify'
import { feedsCardTypes, groupVideoFeeds } from '@/components/feeds/api'
import { nextPageMixin } from './next-page'
import { formatPubTime, formatPubTimeText } from './video-card-pub-time'
import VideoCardList from './VideoCardList.vue'

export default Vue.extend({
  components: {
    VideoCardList,
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
  methods: {
    onCardsUpdate(cards: VideoCard[]) {
      return groupVideoFeeds(cards)
    },
  },
})
</script>

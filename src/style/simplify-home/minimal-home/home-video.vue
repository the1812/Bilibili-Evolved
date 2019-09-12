<template>
  <div class="home-video">
    <div class="loading" v-if="loading">
      <i class="mdi mdi-18px mdi-loading mdi-spin"></i>加载中...
    </div>
    <div class="cards" v-else-if="cards.length">
      <video-card v-for="card of cards" :key="card.id" :data="card"></video-card>
    </div>
    <div class="empty" v-else>空空如也哦 =￣ω￣=</div>
  </div>
</template>

<script lang="ts">
import { VideoCardInfo } from '../video-card.vue'
export default {
  components: {
    VideoCard: () => import('../video-card.vue'),
  },
  data() {
    return {
      cards: [] as VideoCardInfo[],
      loading: true
    }
  },
  async mounted() {
    try {
      const json = await Ajax.getJsonWithCredentials(
        `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${getUID()}&type_list=8`
      )
      const { getWatchlaterList } = await import(
        '../../../video/watchlater-api'
      )
      const watchlaterList = (await getWatchlaterList()) as number[]
      if (json.code !== 0) {
        throw new Error(json.message)
      }
      this.cards = json.data.cards.map(
        (c: any): VideoCardInfo => {
          const card = JSON.parse(c.card)
          const topics = _.get(c, 'display.topic_info.topic_details', []).map(
            (it: any) => {
              return {
                id: it.topic_id,
                name: it.topic_name
              }
            }
          )
          return {
            id: c.desc.dynamic_id_str,
            aid: card.aid,
            title: card.title,
            upID: c.desc.user_profile.info.uid,
            upName: c.desc.user_profile.info.uname,
            upFaceUrl: c.desc.user_profile.info.face,
            coverUrl: card.pic,
            description: card.desc,
            timestamp: c.timestamp,
            time: new Date(c.timestamp * 1000),
            topics,
            dynamic: card.dynamic,
            like: formatCount(c.desc.like),
            duration: card.duration,
            durationText: formatDuration(card.duration, 0),
            playCount: formatCount(card.stat.view),
            danmakuCount: formatCount(card.stat.danmaku),
            watchlater: watchlaterList.includes(card.aid)
          }
        }
      )
    } catch (error) {
      Toast.error(error.message, '视频动态', 3000)
    } finally {
      this.loading = false
    }
  }
}
</script>
<style lang="scss">
.home-video {
  .cards {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }
}
</style>
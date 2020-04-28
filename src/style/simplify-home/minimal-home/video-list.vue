<template>
  <div class="video-list">
    <div class="loading" v-if="loading">
      <i class="mdi mdi-18px mdi-loading mdi-spin"></i>加载中...
    </div>
    <div class="cards" :class="{'show-rank': showRank}" v-else-if="cards.length">
      <video-card
        v-for="card of cards"
        :orientation="useVerticalCards ? 'vertical' : 'horizontal'"
        :key="card.id"
        :data="card"
      ></video-card>
    </div>
    <div class="empty" v-else>空空如也哦 =￣ω￣=</div>
  </div>
</template>

<script lang="ts">
import { VideoCardInfo } from '../video-card-info'
export default {
  components: {
    VideoCard: () => import('../video-card.vue')
  },
  props: ['showRank'],
  data() {
    return {
      cards: [] as VideoCardInfo[],
      useVerticalCards: false,
      loading: true
    }
  },
  methods: {
    async getRankList() {
      const { getTrendingVideos } = await import('../trending-videos')
      // let watchlaterList: number[] | undefined = undefined
      // if (getUID()) {
      //   const { getWatchlaterList } = await import(
      //     '../../../video/watchlater-api'
      //   )
      //   watchlaterList = await getWatchlaterList()
      // }
      const getRankListByDays = async (days: number) => {
        const cards = await getTrendingVideos(days)
        this.cards.push(...cards)
      }
      await Promise.all([1, 3, 7].map(getRankListByDays))
    },
    async getActivityVideos() {
      const json = await Ajax.getJsonWithCredentials(
        `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${getUID()}&type_list=8`
      )
      // let watchlaterList: number[] | undefined = undefined
      // if (getUID()) {
      //   const { getWatchlaterList } = await import(
      //     '../../../video/watchlater-api'
      //   )
      //   watchlaterList = await getWatchlaterList()
      // }
      if (json.code !== 0) {
        throw new Error(json.message)
      }
      this.cards = _.uniqBy(
        json.data.cards.map(
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
              watchlater: true
              // watchlater: watchlaterList ? watchlaterList.includes(card.aid) : undefined,
            }
          }
        ),
        (it: VideoCardInfo) => it.aid
      )
    }
  },
  async mounted() {
    try {
      const media = matchMedia('(max-width: 680px)')
      this.useVerticalCards = media.matches
      media.addListener(e => {
        this.useVerticalCards = e.matches
      })
      if (this.showRank) {
        await this.getRankList()
      } else {
        await this.getActivityVideos()
      }
    } catch (error) {
      Toast.error(error.message, this.showRank ? '热门视频' : '视频动态', 3000)
    } finally {
      this.loading = false
    }
  }
}
</script>
<style lang="scss">
.minimal-home .video-list {
  .loading,
  .empty {
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11pt;
    color: #707070;
    .mdi {
      margin-right: 8px;
    }
    body.dark & {
      color: #eee;
    }
  }
  .cards {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    &.show-rank {
      .video-card:nth-child(1),
      .video-card:nth-child(9),
      .video-card:nth-child(17) {
        margin-top: 48px;
        &::before {
          position: absolute;
          top: -42px;
          left: 0;
          font-size: 14pt;
          font-weight: bold;
        }
      }
      .video-card:nth-child(1)::before {
        content: '今日';
      }
      .video-card:nth-child(9)::before {
        content: '三日';
      }
      .video-card:nth-child(17)::before {
        content: '一周';
      }
    }
  }
}
</style>

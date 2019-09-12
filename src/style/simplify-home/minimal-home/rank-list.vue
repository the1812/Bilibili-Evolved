<template>
  <div class="rank-days-list">
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
    VideoCard: () => import('../video-card.vue')
  },
  props: ['rankDays'],
  data() {
    return {
      cards: [] as VideoCardInfo[],
      loading: true,
    }
  },
  async mounted() {
    try {
      const json = await Ajax.getJsonWithCredentials(
        `https://api.bilibili.com/x/web-interface/ranking/index?day=${this.rankDays}`
      )
      const { getWatchlaterList } = await import(
        '../../../video/watchlater-api'
      )
      const watchlaterList = (await getWatchlaterList()) as number[]
      if (json.code !== 0) {
        throw new Error(json.message)
      }
      this.cards = json.data.map(
        (card: any): VideoCardInfo => {
          return {
            id: card.aid,
            aid: parseInt(card.aid),
            title: card.title,
            upID: card.mid,
            upName: card.author,
            coverUrl: card.pic.replace('http://', 'https://'),
            description: card.description,
            durationText: card.duration,
            playCount: formatCount(card.play),
            coins: formatCount(card.coins),
            favorites: formatCount(card.favorites),
            watchlater: watchlaterList.includes(card.aid)
          }
        }
      )
    } catch (error) {
      Toast.error(error.message, '排行', 3000)
    } finally {
      this.loading = false
    }
  }
}
</script>
<style lang="scss">
.rank-days-list {
  .loading {
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
    align-items: center;
  }
}
</style>

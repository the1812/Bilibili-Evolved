<template>
  <div class="home-video">
    <div class="loading" v-if="loading">
      <i class="mdi mdi-18px mdi-loading mdi-spin"></i>加载中...
    </div>
    <div class="cards" v-else-if="cards.length">
      <a class="home-video-card" v-for="card in cards" :key="card.id" target="_blank" :href="'https://www.bilibili.com/av' + card.aid">
        <div class="cover-container">
          <dpi-img class="cover" :src="card.coverUrl" :size="{height: 240}"></dpi-img>
          <div class="duration">{{card.durationText}}</div>
          <div class="topics">
            <a class="topic" v-for="topic of card.topics" :key="topic.id" target="_blank" :href="'https://t.bilibili.com/topic/name/' + card.name + '/feed'">{{topic.name}}</a>
          </div>
          <div class="watchlater"></div>
        </div>
        <h1 class="title">{{card.title}}</h1>
        <pre class="description">{{card.description}}</pre>
        <dpi-img class="face" :src="card.upFaceUrl" :size="36"></dpi-img>
        <div class="up">{{card.upName}}</div>
        <div class="stats">
          {{card.playCount}}
          {{card.danmakuCount}}
        </div>
      </a>
    </div>
    <div class="empty" v-else>空空如也哦 =￣ω￣=</div>
  </div>
</template>

<script lang="ts">
interface VideoCard {
  id: string
  aid: number
  title: string
  upName: string
  upFaceUrl: string
  coverUrl: string
  description: string
  duration: number
  durationText: string
  playCount: number
  danmakuCount: number
  topics: {
    id: number
    name: string
  }[]
}
export default {
  components: {
    'dpi-img': () => import('../../dpi-img.vue')
  },
  data() {
    return {
      cards: [] as VideoCard[],
      loading: true
    }
  },
  async mounted() {
    try {
      const json = await Ajax.getJsonWithCredentials(
        `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${getUID()}&type_list=8`
      )
      if (json.code !== 0) {
        Toast.error(json.message, '视频动态', 3000)
        return
      }
      this.cards = json.data.cards.map((c: any) => {
        const card = JSON.parse(c.card)
        const topics = _.get(card, 'display.topic_info.topic_details', []).map(
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
          upName: c.desc.user_profile.info.uname,
          upFaceUrl: c.desc.user_profile.info.face,
          coverUrl: card.pic,
          description: card.desc,
          topics,
          duration: card.duration,
          durationText: formatDuration(card.duration, 0),
          playCount: card.stat.view,
          danmakuCount: card.stat.danmaku,
        }
      })
    } finally {
      this.loading = false
    }
  }
}
</script>

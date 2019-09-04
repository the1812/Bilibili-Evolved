<template>
  <div class="home-video">
    <div class="loading" v-if="loading">
      <i class="mdi mdi-18px mdi-loading mdi-spin"></i>加载中...
    </div>
    <div class="cards" v-else-if="cards.length">
      <div class="home-video-card" v-for="card in cards" :key="card.id"></div>
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
  topics: {
    id: number
    name: string
  }[]
}
export default {
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
        return {
          id: c.desc.dynamic_id_str,
          aid: card.aid,
          title: card.title,
          upName: c.desc.user_profile.info.uname,
          upFaceUrl: c.desc.user_profile.info.face,
          description: card.desc,
        }
      })
    } finally {
      this.loading = false
    }
  }
}
</script>

<style lang="scss">
</style>
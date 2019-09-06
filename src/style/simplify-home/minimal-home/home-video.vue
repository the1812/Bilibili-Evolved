<template>
  <div class="home-video">
    <div class="loading" v-if="loading">
      <i class="mdi mdi-18px mdi-loading mdi-spin"></i>加载中...
    </div>
    <div class="cards" v-else-if="cards.length">
      <a
        class="home-video-card"
        v-for="card in cards"
        :key="card.id"
        target="_blank"
        :href="'https://www.bilibili.com/av' + card.aid"
      >
        <div class="cover-container">
          <dpi-img class="cover" :src="card.coverUrl" :size="{height: 160, width: 280}"></dpi-img>
          <div class="duration">{{card.durationText}}</div>
          <div class="topics">
            <a
              class="topic"
              v-for="topic of card.topics"
              :key="topic.id"
              target="_blank"
              :href="'https://t.bilibili.com/topic/name/' + card.name + '/feed'"
            >{{topic.name}}</a>
          </div>
          <div class="watchlater"></div>
        </div>
        <h1 class="title">{{card.title}}</h1>
        <pre class="description">{{card.description}}</pre>
        <dpi-img class="face" :src="card.upFaceUrl" :size="24"></dpi-img>
        <div class="up">{{card.upName}}</div>
        <div class="stats">
          <Icon type="extended" icon="play"></Icon>
          {{card.playCount}}
          <Icon type="extended" icon="danmaku"></Icon>
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
    'dpi-img': () => import('../../dpi-img.vue'),
    Icon: () => import('../../icon.vue'),
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
          danmakuCount: card.stat.danmaku
        }
      })
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

    .home-video-card {
      display: grid;
      grid-template-columns: 280px 1fr;
      grid-template-rows: 1fr 1fr 1fr;
      grid-template-areas:
        'cover title'
        'cover description'
        'cover up';
      height: var(--card-height);
      width: var(--card-width);
      color: black;
      border-radius: 16px;
      box-shadow: 0 2px 6px 0 #0002;
      margin-right: var(--card-margin);
      margin-bottom: var(--card-margin);

      body.dark & {
        background-color: #282828;
        color: white;
      }
      & > * {
        justify-self: self-start;
        align-self: center;
      }

      .cover-container {
        grid-area: cover;
        position: relative;
        .cover {
          border-radius: 16px 0 0 16px;
          object-fit: cover;
        }
        & > :not(.cover) {
          position: absolute;
        }
      }
      .title {
        grid-area: title;
        font-size: 16pt;
        font-weight: bold;
        color: inherit;
        padding: 0 12px;
        white-space: nowrap;
        overflow: hidden;
        justify-self: stretch;
        text-overflow: ellipsis;
      }
      .description {
        grid-area: description;
        color: inherit;
        overflow: auto;
        align-self: stretch;
        justify-self: stretch;
        margin: 0 12px;
        white-space: pre-wrap;
        line-height: 1.5;
        scrollbar-width: none !important;

        &::-webkit-scrollbar {
          width: 0px !important;
        }
      }
      .face,
      .up,
      .stats {
        grid-area: up;
      }
      .face {
        margin-left: 12px;
        border-radius: 50%;
      }
      .up {
        margin-left: 48px;
      }
      .stats {
        justify-self: self-end;
        margin-right: 12px;
      }
    }
  }
}
</style>
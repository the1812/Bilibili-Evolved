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
          <dpi-img class="cover" :src="card.coverUrl" :size="{height: 120, width: 200}"></dpi-img>
          <div class="duration">{{card.durationText}}</div>
          <div class="watchlater" @click.stop.prevent="watchlater(card.id)">
            <i
              class="mdi"
              :class="{'mdi-clock-outline': !card.watchlater, 'mdi-check-circle': card.watchlater}"
            ></i>
            {{card.watchlater ? '已添加' : '稍后再看'}}
          </div>
        </div>
        <h1 class="title" :title="card.title">{{card.title}}</h1>
        <div class="topics" v-if="card.topics.length">
          <a
            class="topic"
            v-for="topic of card.topics"
            :key="topic.id"
            target="_blank"
            :href="'https://t.bilibili.com/topic/name/' + topic.name + '/feed'"
          >#{{topic.name}}#</a>
        </div>
        <pre class="description single-line" :title="card.description" v-else>{{card.description}}</pre>
        <a class="up" target="_blank" :href="'https://space.bilibili.com/' + card.upID">
          <dpi-img class="face" :src="card.upFaceUrl" :size="24"></dpi-img>
          <div class="name" :title="card.upName">{{card.upName}}</div>
        </a>
        <div class="stats">
          <Icon type="extended" icon="like"></Icon>
          {{card.like}}
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
  upID: number
  upName: string
  upFaceUrl: string
  coverUrl: string
  description: string
  duration: number
  durationText: string
  playCount: string
  danmakuCount: string
  dynamic: string
  like: string
  timestamp: number
  time: Date
  topics: {
    id: number
    name: string
  }[]
  watchlater: boolean
}
export default {
  components: {
    'dpi-img': () => import('../../dpi-img.vue'),
    Icon: () => import('../../icon.vue')
  },
  data() {
    return {
      cards: [] as VideoCard[],
      loading: true
    }
  },
  methods: {
    async watchlater(id: string) {
      const card = this.cards.find((it: VideoCard) => it.id === id) as VideoCard
      try {
        card.watchlater = !card.watchlater
        const { toggleWatchlater } = await import(
          '../../../video/watchlater-api'
        )
        toggleWatchlater(card.aid.toString(), card.watchlater)
      } catch (error) {
        card.watchlater = !card.watchlater
        Toast.error(error.message, '稍后再看操作失败', 3000)
      }
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
        (c: any): VideoCard => {
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

    .home-video-card {
      display: grid;
      grid-template-columns: 200px 1fr;
      grid-template-rows: 3fr 2fr 3fr;
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
      &:hover {
        transform: scale(1.02);
        transition: 0.1s cubic-bezier(0.39, 0.58, 0.57, 1);

        .duration,
        .watchlater {
          opacity: 1;
        }
      }
      .duration,
      .watchlater {
        opacity: 0;
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
        .duration,
        .watchlater {
          bottom: 6px;
          padding: 4px 8px;
          background-color: #000a;
          color: white;
          border-radius: 14px;
          height: 24px;
          .mdi {
            font-size: 12pt;
            line-height: 1;
            margin-right: 4px;
          }
        }
        .duration {
          left: 6px;
        }
        .watchlater {
          right: 6px;
          display: flex;
          align-items: center;
          padding-left: 4px;
        }
      }
      .title {
        grid-area: title;
        font-size: 12pt;
        font-weight: bold;
        color: inherit;
        padding: 0 12px;
        white-space: nowrap;
        overflow: hidden;
        justify-self: stretch;
        text-overflow: ellipsis;
      }
      .topics {
        grid-area: description;
        display: flex;
        align-items: center;
        margin-left: 12px;
        .topic {
          color: inherit;
          padding: 4px 8px;
          background-color: #8882;
          margin-right: 8px;
          border-radius: 14px;
        }
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
        &.single-line {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
      .up,
      .stats {
        grid-area: up;
      }
      .up {
        margin-left: 12px;
        display: flex;
        align-items: center;
        padding: 2px;
        background-color: #8882;
        border-radius: 14px;
        color: inherit;
        .face {
          border-radius: 50%;
        }
        .name {
          margin: 0 8px;
        }
        &:hover .name {
          color: var(--theme-color);
        }
      }
      .stats {
        justify-self: self-end;
        margin-right: 12px;
        display: flex;
        align-items: center;
        opacity: 0.5;
        .be-icon {
          font-size: 12pt;
          margin: 0 4px 0 12px;
        }
      }
    }
  }
}
</style>
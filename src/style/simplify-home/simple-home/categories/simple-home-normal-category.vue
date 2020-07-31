<template>
  <div
    class="category-view"
    :class="{'new-activity-loading': newActivity.loading,'new-post-loading': newPost.loading,'rank-loading': rank.loading}"
  >
    <slideshow-cards
      class="new-activity"
      :cards="newActivity.videos"
      :error="newActivity.error"
      :show-stat="true"
      @refresh="loadNewActivity()"
      title="有新动态"
    ></slideshow-cards>
    <slideshow-cards
      class="new-post"
      :cards="newPost.videos"
      :error="newPost.errors"
      :show-stat="false"
      @refresh="loadNewPost()"
      title="最新发布"
    ></slideshow-cards>
    <rank-list :videos="rank.videos" :rank-link="rankLink"></rank-list>
    <div class="new-activity loading"></div>
    <div class="new-post loading"></div>
    <div class="rank loading"></div>
  </div>
</template>

<script lang="ts">
import { VideoCardInfo } from '../../video-card-info'
// 有新动态 https://api.bilibili.com/x/web-interface/dynamic/region?ps=10&rid=1
// 最新发布 https://api.bilibili.com/x/web-interface/newlist?ps=10&rid=1
// 排行 https://api.bilibili.com/x/web-interface/ranking/region?rid=1&day=3&original=0
export default {
  components: {
    SlideshowCards: () => import('../slideshow-cards.vue'),
    RankList: () => import('../rank-list.vue')
  },
  store,
  props: {
    rid: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      newActivity: {
        error: false,
        loading: true,
        videos: []
      },
      newPost: {
        error: false,
        loading: true,
        videos: []
      },
      rank: {
        error: false,
        loading: true,
        videos: []
      },
      // watchlaterList: null,
      loaded: false
    }
  },
  computed: {
    ...Vuex.mapState(['watchlaterList']),
    rankLink() {
      if (this.rid === 165) {
        // 165: 广告区没有排行榜
        return null
      }
      let type = 'all'
      if (this.rid === 177 || this.rid === 23 || this.rid === 11) {
        // 纪录片 电影 TV剧 在另一个分类下
        type = 'cinema'
      }
      return `https://www.bilibili.com/ranking/${type}/${this.rid}/0/3`
    }
  },
  methods: {
    async loadCards(
      entityName: string,
      api: string,
      parseJson?: (json: any) => VideoCardInfo[]
    ) {
      if (parseJson === undefined) {
        // default slideshow cards parser
        parseJson = (json: any) => {
          const uid = getUID()
          const items = _.get(json, 'data.archives', [])
          return items.map((item: any) => {
            return {
              id: item.aid,
              aid: item.aid,
              coverUrl: item.pic.replace('http:', 'https:'),
              title: item.title,
              upName: item.owner.name,
              upFaceUrl: item.owner.face.replace('http:', 'https:'),
              upID: item.owner.mid,
              playCount: item.stat.view,
              danmakuCount: item.stat.danmaku,
              like: item.stat.like,
              coins: item.stat.coin,
              description: item.desc,
              type: item.tname,
              watchlater: uid ? this.watchlaterList.includes(item.aid) : null
            } as VideoCardInfo
          })
        }
      }
      try {
        this[entityName].loading = true
        const json = await Ajax.getJson(api)
        if (json.code !== 0) {
          this[entityName].error = true
        }
        // const { getWatchlaterList } = await import(
        //   '../../../../video/watchlater-api'
        // )
        // if (this.watchlaterList === null) {
        //   const uid = getUID()
        //   this.watchlaterList = uid ? await getWatchlaterList() : []
        // }
        this[entityName].videos = parseJson(json)
      } catch (error) {
        logError(error)
        this[entityName].error = true
      } finally {
        this[entityName].loading = false
      }
    },
    async loadNewActivity() {
      await this.loadCards(
        'newActivity',
        `https://api.bilibili.com/x/web-interface/dynamic/region?ps=10&rid=${this.rid}`
      )
    },
    async loadNewPost() {
      await this.loadCards(
        'newPost',
        `https://api.bilibili.com/x/web-interface/newlist?ps=10&rid=${this.rid}`
      )
    },
    async loadRank() {
      await this.loadCards(
        'rank',
        `https://api.bilibili.com/x/web-interface/ranking/region?rid=${this.rid}&day=3&original=0`,
        (json: any) => {
          const uid = getUID()
          const items = (_.get(json, 'data', []) || []) as any[]
          return items.map(item => {
            return {
              id: item.aid,
              aid: parseInt(item.aid),
              title: item.title,
              playCount: item.play,
              favorites: item.favorites,
              upID: item.mid,
              upName: item.author,
              description: item.description,
              coverUrl: item.pic.replace('http:', 'https:'),
              coins: item.coins,
              durationText: item.duration,
              points: item.pts,
              watchlater: uid
                ? this.watchlaterList.includes(parseInt(item.aid))
                : null
            } as VideoCardInfo
          })
        }
      )
    },
    ...Vuex.mapActions(['toggleWatchlater']),
    updateVideos() {
      this.loadNewActivity()
      this.loadNewPost()
      this.loadRank()
    }
  },
  watch: {
    rid(value: number) {
      if (value > 0) {
        if (this.loaded) {
          this.updateVideos()
        }
      } else {
        console.warn(`rid=${value}`)
      }
    }
  },
  mounted() {
    // console.log(this.rid)
    const observer = new IntersectionObserver(() => {
      this.updateVideos()
      this.loaded = true
      observer.disconnect()
    })
    observer.observe(this.$el)
  }
}
</script>

<style lang="scss">
.category-view {
  display: grid;
  grid-template:
    'new-activity rank' 1fr
    'new-post rank' 1fr / 1fr calc(1.5 * var(--rank-width) + 10px);
  grid-row-gap: 24px;
  row-gap: 24px;
  grid-column-gap: 32px;
  column-gap: 32px;
  position: relative;
  &,
  & *,
  ::after,
  ::before {
    transition: 0.2s ease-out;
  }
  .loading {
    opacity: 0;
    pointer-events: none;
    border-radius: 16px;
    position: absolute;
  }
  .new-activity {
    align-self: start;
  }
  .new-post {
    align-self: end;
  }
  @each $name in ('new-activity', 'new-post', 'rank') {
    .#{$name} {
      grid-area: unquote($name);
    }
    &.#{$name}-loading {
      .#{$name}.loading {
        position: static;
        animation: 0.64s infinite alternate category-loading ease-in-out;
        opacity: 1;
        pointer-events: initial;
        width: 100%;
        height: 100%;
      }
      .#{$name}:not(.loading) {
        opacity: 0;
        pointer-events: none;
      }
    }
  }
  @media screen and (max-width: 1300px) {
    grid-template:
      'new-activity' 1fr
      'new-post' 1fr
      'rank' auto / 1fr;
    // --card-height: 300px;
    .rank {
      // --rank-width: 420px;
      display: none;
      justify-self: center;
    }
  }
}
</style>
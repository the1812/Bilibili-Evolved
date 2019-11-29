<template>
  <div
    class="category-view"
    :class="{'new-activity-loading': newActivity.loading,'new-post-loading': newPost.loading,'rank-loading': rank.loading}"
  >
    <slideshow-cards
      class="new-activity"
      :cards="newActivity.videos"
      :error="newActivity.error"
      title="有新动态"
    ></slideshow-cards>
    <slideshow-cards class="new-post" :cards="newPost.videos" :error="newPost.errors" title="最新发布"></slideshow-cards>
    <div class="rank"></div>

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
    SlideshowCards: () => import('../slideshow-cards.vue')
  },
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
      }
    }
  },
  methods: {
    async loadSlideshowCards(entityName: string, api: string) {
      try {
        const json = await Ajax.getJson(api)
        if (json.code !== 0) {
          this[entityName].error = true
        }
        const { getWatchlaterList } = await import(
          '../../../../video/watchlater-api'
        )
        const uid = getUID()
        const watchlaterList = uid ? await getWatchlaterList() : []
        const items = _.get(json, 'data.archives', [])
        const videos: VideoCardInfo[] = items.map((item: any) => {
          return {
            id: item.aid,
            aid: item.aid,
            coverUrl: item.pic,
            title: item.title,
            upName: item.owner.name,
            upFaceUrl: item.owner.face,
            upID: item.owner.mid,
            playCount: item.stat.view,
            danmakuCount: item.stat.danmaku,
            like: item.stat.like,
            coins: item.stat.coin,
            description: item.desc,
            watchlater: uid ? watchlaterList.includes(item.aid) : null
          } as VideoCardInfo
        })
        this[entityName].videos = videos
      } catch (error) {
        logError(error)
      } finally {
        this[entityName].loading = false
      }
    },
    async loadNewActivity() {
      await this.loadSlideshowCards(
        'newActivity',
        `https://api.bilibili.com/x/web-interface/dynamic/region?ps=10&rid=${this.rid}`
      )
    },
    async loadNewPost() {
      await this.loadSlideshowCards('newPost', `https://api.bilibili.com/x/web-interface/newlist?ps=10&rid=${this.rid}`)
    },
    async loadRank() {},
    updateVideos() {
      this.loadNewActivity()
      this.loadNewPost()
      this.loadRank()
    }
  },
  watch: {
    rid(value: number) {
      if (value > 0) {
        this.updateVideos()
      } else {
        console.warn(`rid=${value}`)
      }
    }
  },
  mounted() {
    console.log(this.rid)
    this.updateVideos()
  }
}
</script>

<style lang="scss">
.category-view {
  display: grid;
  grid-template:
    'new-activity rank' 1fr
    'new-post rank' 1fr / 3fr 1fr;
  grid-gap: 24px;
  gap: 24px;
  --loading-from: #d4d4d4;
  --loading-to: #ddd;
  &,
  & *,
  ::after,
  ::before {
    transition: 0.2s ease-out;
  }
  @keyframes normal-category-loading {
    from {
      background-color: var(--loading-from);
    }
    to {
      background-color: var(--loading-to);
    }
  }
  body.dark & {
    --loading-from: #333;
    --loading-to: #262626;
  }
  .loading {
    opacity: 0;
    pointer-events: none;
    border-radius: 16px;
    animation: 0.64s infinite alternate normal-category-loading ease-in-out;
    position: absolute;
    &.new-activity {
      height: 30vh;
    }
  }
  @each $name in ('new-activity', 'new-post', 'rank') {
    .#{$name} {
      grid-area: unquote($name);
    }
    &.#{$name}-loading {
      .#{$name}.loading {
        position: static;
        opacity: 1;
        pointer-events: initial;
      }
      .#{$name}:not(.loading) {
        opacity: 0;
        pointer-events: none;
      }
    }
  }
}
</style>
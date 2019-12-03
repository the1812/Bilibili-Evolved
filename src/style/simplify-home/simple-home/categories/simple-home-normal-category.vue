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
    <div class="rank">
      <a
        class="rank-item"
        v-for="(c, index) of rank.videos"
        :key="c.id"
        target="_blank"
        :href="'https://www.bilibili.com/av' + c.aid"
      >
        <div class="cover">
          <dpi-img :src="c.coverUrl" :size="{ width: 200, height: 120 }"></dpi-img>
        </div>
        <div class="rank-number">{{index + 1}}</div>
        <div class="grow"></div>
        <div class="title">{{c.title}}</div>
        <div class="up">
          <div class="points">
            <Icon icon="fire" type="mdi"></Icon>
            {{c.points | bigNumber}}
          </div>
          <div class="up-info">
            <Icon icon="up" type="extended"></Icon>
            <div class="up-name">{{c.upName}}</div>
          </div>
        </div>
        <div class="stats">
          <icon type="extended" icon="play"></icon>
          <div class="number">{{c.playCount | bigNumber}}</div>
          <icon type="extended" icon="coin"></icon>
          <div class="number">{{c.coins | bigNumber}}</div>
          <icon type="extended" icon="favorites"></icon>
          <div class="number">{{c.favorites | bigNumber}}</div>
        </div>
        <!-- <div class="watchlater" v-if="c.watchlater !== null" :title="watchlater ? '已添加' : '稍后再看'">
          <icon v-if="c.watchlater" type="mdi" icon="clock-outline"></icon>
          <icon v-else type="mdi" icon="check-cricle"></icon>
        </div>-->
      </a>
    </div>

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
    Icon: () => import('../../../icon.vue'),
    DpiImg: () => import('../../../dpi-img.vue')
  },
  filters: {
    bigNumber(value: number) {
      return formatCount(value)
    }
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
      },
      watchlaterList: null
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
        const { getWatchlaterList } = await import(
          '../../../../video/watchlater-api'
        )
        if (this.watchlaterList === null) {
          const uid = getUID()
          this.watchlaterList = uid ? await getWatchlaterList() : []
        }
        this[entityName].videos = parseJson(json)
      } catch (error) {
        logError(error)
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
          const items = json.data as any[]
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
    // &.new-activity {
    //   height: 30vh;
    // }
  }
  .rank {
    display: grid;
    width: 290px;
    grid-template:
      'first first' 170px
      'second third' 85px/1fr 1fr;
    grid-gap: 10px;
    gap: 10px;
    .rank-item {
      border-radius: 16px;
      grid-column: 1 / 3;
      box-shadow: 0 4px 8px 0 #0001;
      color: inherit !important;
      position: relative;
      .cover {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 16px;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      &:hover .cover img {
        transform: scale(1.05);
      }
      .rank-number {
        position: absolute;
        top: 6px;
        left: 6px;
        width: 22px;
        height: 22px;
        line-height: 22px;
        border-radius: 50%;
        box-sizing: border-box;
        text-align: center;
        font-weight: bold;
        font-size: 13px;
        background-color: #ddd;
        body.dark & {
          background-color: #333;
        }
      }
      & > :not(.cover):not(.rank-number) {
        z-index: 10;
      }
      .be-icon {
        font-size: 16px;
      }

      &:first-child,
      &:nth-child(2),
      &:nth-child(3) {
        .rank-number {
          background-color: var(--theme-color);
          color: var(--foreground-color);
        }
      }
      &:first-child {
        grid-area: first;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: flex-start;
        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 16px;
          background-image: linear-gradient(to top, #000a 0%, transparent 61%);
          z-index: 9;
        }
        .grow {
          flex: 1 0 0;
        }
        .title {
          font-weight: bold;
          font-size: 16px;
          line-height: 1.5;
          color: #fff;
          padding: 0 8px;
        }
        .up {
          display: flex;
          align-self: stretch;
          justify-content: space-between;
          align-items: center;
          opacity: 0.75;
          color: #fff;
          padding: 0 12px 0 6px;
          margin: 4px 0 8px 0;
          & > * {
            display: flex;
            align-items: center;
          }
          .mdi-fire {
            transform: scale(calc(18 / 16));
            margin-right: 2px;
          }
          .be-iconfont-up {
            margin-right: 4px;
          }
          .points {
            flex-shrink: 0;
            margin-right: 8px;
          }
          .up-info {
            max-width: 61%;
            .up-name {
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              word-break: break-all;
            }
          }
        }
        .stats {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          color: #fff;
          opacity: 0;
          padding: 0 8px;
          position: absolute;
          bottom: 8px;
          left: 0;
          .be-icon {
            margin: 0 2px 0 8px;
            &:first-child {
              margin-left: 0;
            }
          }
        }
        &:hover {
          .up {
            opacity: 0;
          }
          .stats {
            opacity: 0.75;
          }
        }
      }
      &:nth-child(2) {
        grid-area: second;
      }
      &:nth-child(3) {
        grid-area: third;
      }
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
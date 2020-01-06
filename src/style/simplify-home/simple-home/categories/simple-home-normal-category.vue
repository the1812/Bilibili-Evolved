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
      <div class="area-header">排行榜</div>
      <a
        class="rank-item"
        v-for="(c, index) of rank.videos"
        :key="c.id"
        target="_blank"
        :href="'https://www.bilibili.com/av' + c.aid"
      >
        <div class="cover">
          <dpi-img :src="c.coverUrl" :size="{ width: 370 }"></dpi-img>
        </div>
        <div class="rank-number">{{index + 1}}</div>
        <div
          v-if="index === 0 || index > 2"
          class="title"
          :title="index === 0 ? c.title : null"
        >{{c.title}}</div>
        <div
          class="watchlater"
          v-if="c.watchlater !== null"
          :title="watchlaterList.includes(c.aid) ? '已添加' : '稍后再看'"
          @click.prevent="toggleWatchlater(c.aid)"
        >
          <icon v-if="watchlaterList.includes(c.aid)" type="mdi" icon="check-circle"></icon>
          <icon v-else type="mdi" icon="clock-outline"></icon>
        </div>
        <div class="details">
          <div v-if="index > 0 && index < 3" class="title" :title="c.title">{{c.title}}</div>
          <div v-if="index > 0 && index < 3" class="cover">
            <dpi-img :src="c.coverUrl" :size="{ width: 370 }"></dpi-img>
          </div>
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
        </div>
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
  store,
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
      // watchlaterList: null,
      loaded: false
    }
  },
  computed: {
    ...Vuex.mapState(['watchlaterList'])
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
  --loading-from: #d4d4d4;
  --loading-to: #ddd;
  --rank-width: 370px;
  --rank-height: calc(var(--rank-width) / 16 * 9);
  --slideshow-ratio: 0.6;
  --card-height: 300px;
  --card-width: calc(var(--card-height) * (42 / 25));
  display: grid;
  grid-template:
    'new-activity rank' 1fr
    'new-post rank' 1fr / 1fr calc(1.5 * var(--rank-width) + 10px);
  grid-row-gap: 24px;
  row-gap: 24px;
  grid-column-gap: 32px;
  column-gap: 32px;
  position: relative;
  @for $width from 18 through 7 {
    @media screen and (max-width: #{$width * 100}px) {
      --card-height: #{300 - 12 * (19 - $width)}px;
      --rank-width: #{370 - 20 * (19 - $width)}px;
    }
  }
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
  .area-header {
    grid-area: header;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    font-weight: bold;
    font-size: 11pt;
    margin-bottom: 12px;
    &::before {
      content: '';
      display: inline-flex;
      height: 10px;
      width: 10px;
      background-color: var(--theme-color);
      border-radius: 50%;
      margin-right: 8px;
    }
  }
  .rank {
    display: grid;
    width: calc(1.5 * var(--rank-width) + 10px);
    height: calc(2 * (var(--card-height) + 20px) + 48px);
    justify-self: right;
    overflow: auto;
    scrollbar-width: none !important;
    &::-webkit-scrollbar {
      height: 0 !important;
      width: 0 !important;
    }
    // grid-template:
    //   'header header' auto
    //   'first first' calc(10px + var(--rank-height))
    //   'second third' calc(var(--rank-height) / 2 + 10px) / calc(
    //     var(--rank-width) / 2
    //   )
    //   calc(var(--rank-width) / 2);
    grid-template:
      'header header' auto
      'first second' calc(var(--rank-height) / 2 + 10px)
      'first third' calc(var(--rank-height) / 2 + 10px)
      / calc(var(--rank-width)) calc(10px + var(--rank-width) / 2);
    @mixin hover-details {
      .details {
        position: absolute;
        top: 0;
        right: calc(100% + 10px);
        // transform: translateY(-50%);
        width: var(--rank-width);
        padding: 4px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: stretch;
        z-index: 10;
        opacity: 0;
        pointer-events: none;
        .title {
          font-weight: bold;
          font-size: 14px;
          line-height: 1.5;
          color: #fff;
          padding: 8px;
          z-index: 10;
        }
        .cover {
          overflow: hidden;
          background-color: black;
          img {
            filter: blur(16px) brightness(0.5);
            transform: scale(1.5);
          }
        }
        .up,
        .stats {
          z-index: 10;
          display: flex;
          color: #fff;
          .be-icon:not(.mdi-fire) {
            margin: 0 4px 0 8px;
          }
        }
        .up {
          justify-content: space-between;
          margin: 0 10px 0 6px;
          & > * {
            display: flex;
            align-items: center;
          }
        }
        .stats {
          margin: 8px;
          .be-icon:first-child {
            margin-left: 0;
          }
        }
      }
      &:hover .details {
        opacity: 1;
      }
    }
    .area-header {
      margin-bottom: 0;
      padding-bottom: 12px;
      position: -webkit-sticky;
      position: sticky;
      top: 0;
      z-index: 1000;
      background-color: #F4F4F4;
      body.dark & {
        background-color: #161616;
      }
    }
    .rank-item {
      grid-column: 1 / 3;
      color: inherit !important;
      position: relative;
      &:not(:nth-child(n + 5)) {
        background-color: #fff;
        body.dark & {
          background-color: #282828;
        }
      }
      .cover {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 12px;
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
        top: 4px;
        left: 4px;
        width: 20px;
        height: 20px;
        line-height: 20px;
        border-radius: 50%;
        box-sizing: border-box;
        text-align: center;
        font-weight: 700;
        font-size: 12px;
        z-index: 9;
        background-color: #000c;
        color: #fff;
      }
      .watchlater {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        box-sizing: border-box;
        z-index: 9;
        background-color: #000a;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
      }
      &:hover .watchlater {
        opacity: 1;
      }
      .be-icon {
        font-size: 16px;
        &.mdi-fire {
          transform: scale(calc(18 / 16));
          margin-right: 2px;
        }
      }
      &:not(:nth-child(2)) {
        & > .title {
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: bold;
          font-size: 14px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          max-height: 2.8em;
          word-break: break-all;
          line-height: 1.4;
          padding: 0 8px;
          margin-top: 4px;
          // opacity: 0.9;
        }
        // &:hover {
        //   background-color: var(--theme-color-30);
        //   & > .title {
        //     opacity: 1;
        //   }
        // }
      }

      &:nth-child(2),
      &:nth-child(3),
      &:nth-child(4) {
        border-radius: 16px;
        .rank-number {
          background-color: var(--theme-color);
          color: var(--foreground-color);
          opacity: 0.9;
        }
      }
      // &:nth-child(4) {
      //   border-radius: 16px 16px 0 0;
      // }
      // &:nth-last-child(2) {
      //   border-radius: 0 0 16px 16px;
      // }
      &:nth-child(2) {
        grid-area: first;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: flex-start;
        margin-bottom: 10px;
        .details {
          align-self: stretch;
        }
        .cover::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: linear-gradient(to top, #000c 0, transparent 100%);
          z-index: 0;
        }
        .title {
          font-weight: bold;
          font-size: 16px;
          line-height: 1.5;
          color: #fff;
          padding: 0 8px;
          z-index: 10;
          white-space: nowrap;
          overflow: hidden;
          max-width: 100%;
          text-overflow: ellipsis;
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
          z-index: 10;
          & > * {
            display: flex;
            align-items: center;
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
          z-index: 10;
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
      &:nth-child(3) {
        grid-area: second;
        // margin-right: 5px;
        margin-bottom: 10px;
        margin-left: 10px;
        @include hover-details();
      }
      &:nth-child(4) {
        grid-area: third;
        // margin-left: 5px;
        margin-bottom: 10px;
        margin-left: 10px;
        @include hover-details();
      }
      &:nth-child(n + 5) {
        background-color: transparent;
        display: grid;
        grid-template:
          'cover title watchlater' 2fr
          'cover up up' 1fr / 120px 1fr auto;
        &:not(:nth-child(5)) {
          // padding-top: 6px;
          // border-top: 1px solid #8882 !important;
          margin-top: 12px;
          &::before {
            content: "";
            width: 100%;
            height: 1px;
            background-color: #8882;
            position: absolute;
            bottom: calc(100% + 6px);
            left: 0;
          }
        }
        & > .cover {
          grid-area: cover;
          position: static;
          width: 120px;
          height: 70px;
        }
        & > .title {
          grid-area: title;
        }
        .watchlater {
          grid-area: watchlater;
        }
        .details {
          grid-area: up;
          opacity: .75;
          &,
          & * {
            display: flex;
            align-items: center;
          }
          .up {
            margin: 4px 6px;
            position: absolute;
            bottom: 0;
            .up-info {
              margin-left: 16px;
              .up-name {
                margin-left: 4px;
              }
            }
          }
          .stats {
            position: absolute;
            bottom: 0;
            display: flex;
            align-items: center;
            margin: 4px 8px;
            opacity: 0;
            .number {
              margin: 0 12px 0 4px;
            }
          }
        }
        &:hover {
          .up {
            opacity: 0;
          }
          .stats {
            opacity: 1;
          }
        }
      }
    }
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
    --card-height: 300px;
    .rank {
      --rank-width: 420px;
      justify-self: center;
    }
  }
}
</style>
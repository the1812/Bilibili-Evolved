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
        <div v-if="index < 3" class="cover">
          <dpi-img :src="c.coverUrl" :size="{ width: 200, height: 120 }"></dpi-img>
        </div>
        <div class="rank-number">{{index + 1}}</div>
        <div v-if="index === 0 || index > 2" class="title" :title="c.title">{{c.title}}</div>
        <!-- <div class="watchlater" v-if="c.watchlater !== null" :title="watchlater ? '已添加' : '稍后再看'">
          <icon v-if="c.watchlater" type="mdi" icon="clock-outline"></icon>
          <icon v-else type="mdi" icon="check-cricle"></icon>
        </div>-->
        <div class="details">
          <div v-if="index > 0" class="title" :title="c.title">{{c.title}}</div>
          <div v-if="index > 0" class="cover">
            <dpi-img :src="c.coverUrl" :size="{ width: 200, height: 120 }"></dpi-img>
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
      <div class="area-header">排行榜</div>
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
  --loading-from: #d4d4d4;
  --loading-to: #ddd;
  --rank-width: 420px;
  --rank-height: 250px;
  --slideshow-ratio: 1.2;
  display: grid;
  grid-template:
    'new-activity rank' 1fr
    'new-post rank' 1fr / 1fr var(--rank-width);
  grid-gap: 24px;
  gap: 24px;
  position: relative;
  @for $width from 18 through 9 {
    @media screen and (max-width: #{$width * 100}px) {
      & {
        $rank-width: 420 - (19 - $width) * 30;
        --rank-width: #{$rank-width}px;
        --rank-height: #{$rank-width * 25 / 42}px;
        --slideshow-ratio: #{1.2 * ($width / 18)};
      }
    }
  }
  --card-height: calc((8 * 34px + 20px + 1.5 * var(--rank-height)) / 2 - 32px);
  --card-width: calc(var(--card-height) * (42 / 25));
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
    width: var(--rank-width);
    grid-template:
      'header header' auto
      'first first' calc(10px + var(--rank-height))
      'second third' calc(var(--rank-height) / 2 + 10px) / 1fr 1fr;
    .rank-item {
      grid-column: 1 / 3;
      box-shadow: 0 4px 8px 0 #0001;
      background-color: #fff;
      color: inherit !important;
      position: relative;
      body.dark & {
        background-color: #282828;
      }
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
        z-index: 9;
        background-color: #8884;
      }
      .be-icon {
        font-size: 16px;
        &.mdi-fire {
          transform: scale(calc(18 / 16));
          margin-right: 2px;
        }
      }
      &:not(:first-child) {
        & > .title {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: bold;
          font-size: 13px;
          line-height: 34px;
          padding: 0 8px 0 34px;
          opacity: 0.9;
        }
        &:hover {
          background-color: var(--theme-color-30);
          & > .title {
            opacity: 1;
          }
        }
        .details {
          position: absolute;
          top: 50%;
          right: calc(100% + 10px);
          transform: translateY(-50%);
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

      &:first-child,
      &:nth-child(2),
      &:nth-child(3) {
        border-radius: 16px;
        .rank-number {
          background-color: var(--theme-color);
          color: var(--foreground-color);
          opacity: 0.9;
        }
      }
      &:nth-child(4) {
        border-radius: 16px 16px 0 0;
      }
      &:nth-last-child(2) {
        border-radius: 0 0 16px 16px;
      }
      &:first-child {
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
          border-radius: 16px;
          background-image: linear-gradient(to top, #000a 0%, transparent 61%);
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
      &:nth-child(2) {
        grid-area: second;
        margin-right: 5px;
        margin-bottom: 10px;
      }
      &:nth-child(3) {
        grid-area: third;
        margin-left: 5px;
        margin-bottom: 10px;
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
}
</style>
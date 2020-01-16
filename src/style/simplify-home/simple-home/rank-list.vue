<template>
  <div class="rank">
    <div class="area-header">排行榜</div>
    <a
      class="rank-item"
      v-for="(c, index) of videos"
      :key="c.id"
      target="_blank"
      :href="c.href || ('https://www.bilibili.com/av' + c.aid)"
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
            <icon icon="fire" type="mdi"></icon>
            {{c.points | bigNumber}}
          </div>
          <div class="up-info" v-if="c.upName">
            <icon icon="up" type="extended"></icon>
            <div class="up-name">{{c.upName}}</div>
          </div>
          <div class="ep-title" v-if="c.epTitle">
            <div>{{c.epTitle}}</div>
          </div>
        </div>
        <div class="stats">
          <template v-if="c.playCount">
            <icon type="extended" icon="play"></icon>
            <div class="number">{{c.playCount | bigNumber}}</div>
          </template>
          <template v-if="c.coins">
            <icon type="extended" icon="coin"></icon>
            <div class="number">{{c.coins | bigNumber}}</div>
          </template>
          <template v-if="c.favorites">
            <icon type="extended" icon="favorites"></icon>
            <div class="number">{{c.favorites | bigNumber}}</div>
          </template>
          <template v-if="c.danmakuCount">
            <icon type="extended" icon="danmaku"></icon>
            <div class="number">{{c.danmakuCount | bigNumber}}</div>
          </template>
        </div>
      </div>
    </a>
  </div>
</template>

<script lang="ts">
export default {
  props: ['videos'],
  filters: {
    bigNumber(value: number) {
      return formatCount(value)
    }
  },
  components: {
    Icon: () => import('../../icon.vue'),
    DpiImg: () => import('../../dpi-img.vue')
  },
  computed: {
    ...Vuex.mapState(['watchlaterList'])
  },
  methods: {
    ...Vuex.mapActions(['toggleWatchlater'])
  }
}
</script>

<style lang="scss">
.simple-home .rank {
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
    background-color: #f4f4f4;
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
        'cover title' 2fr
        'cover up' 1fr / 120px 1fr;
      &:not(:nth-child(5)) {
        // padding-top: 6px;
        // border-top: 1px solid #8882 !important;
        margin-top: 12px;
        &::before {
          content: '';
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
        right: unset;
        left: 96px;
      }
      .details {
        grid-area: up;
        opacity: 0.75;
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
            .up-name {
              margin-left: 4px;
            }
          }
          & > :not(:last-child) {
            margin-right: 16px;
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
</style>
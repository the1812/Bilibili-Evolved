<template>
  <a
    class="video-card"
    target="_blank"
    :href="epID ? ('https://www.bilibili.com/bangumi/play/ep' + epID) : ('https://www.bilibili.com/' + bvid)"
    :class="{ vertical: orientation === 'vertical', 'no-stats': !showStats }"
  >
    <div class="cover-container">
      <DpiImage class="cover" :src="coverUrl" :size="{ height: 120, width: 200 }"></DpiImage>
      <div v-if="isNew" class="new">NEW</div>
      <template v-if="pubTime && pubTimeText">
        <div class="publish-time-summary">
          {{ pubTimeText }}
        </div>
        <div class="publish-time-detail">
          {{ pubTime }}
        </div>
      </template>
      <div v-if="durationText" class="duration">{{ durationText }}</div>
      <div
        v-if="durationText && watchlater !== null && watchlater !== undefined"
        class="watchlater"
        @click.stop.prevent="toggleWatchlater(aid)"
      >
        <VIcon
          :size="15"
          :icon="watchlater ? 'mdi-check-circle' : 'mdi-clock-outline'"
        ></VIcon>
        {{ watchlater ? '已添加' : '稍后再看' }}
      </div>
    </div>
    <h1 class="title" :title="title">{{ title }}</h1>
    <div v-if="topics && topics.length" class="topics">
      <a
        v-for="topic of topics.slice(0,3)"
        :key="topic.id"
        class="topic"
        target="_blank"
        :href="'https://t.bilibili.com/topic/name/' + topic.name + '/feed'"
      >#{{ topic.name }}#</a>
    </div>
    <p v-else class="description" :title="description">{{ description }}</p>
    <a
      v-if="cooperation.length === 0"
      class="up"
      :class="{ 'no-face': !upFaceUrl }"
      target="_blank"
      :href="upID ? ('https://space.bilibili.com/' + upID) : null"
    >
      <DpiImage v-if="upFaceUrl" class="face" :src="upFaceUrl" :size="24" />
      <VIcon v-else icon="up" />
      <div class="name" :title="upName">{{ upName }}</div>
    </a>
    <div v-if="cooperation.length !== 0" class="cooperation">
      <div class="cooperation-ups">
        <a
          v-for="up of reversedCooperation"
          :key="up.id"
          class="cooperation-up"
          :class="{ 'no-face': !up.faceUrl }"
          target="_blank"
          :title="up.name"
          :href="up.id ? ('https://space.bilibili.com/' + up.id) : null"
        >
          <DpiImage v-if="up.faceUrl" class="face" :src="up.faceUrl" :size="24" />
          <VIcon v-else icon="up" />
        </a>
      </div>
      <div class="cooperation-note">
        联合投稿
      </div>
    </div>
    <div v-if="showStats" class="stats">
      <template v-if="like && !vertical">
        <VIcon icon="like-outline" :size="18"></VIcon>
        {{ like }}
      </template>
      <template v-if="coins && !vertical">
        <VIcon icon="coin-outline" :size="18"></VIcon>
        {{ coins }}
      </template>
      <template v-if="favorites">
        <VIcon icon="favorites-outline" :size="18"></VIcon>
        {{ favorites }}
      </template>
      <template v-if="playCount">
        <VIcon icon="play" :size="18"></VIcon>
        {{ playCount }}
      </template>
      <template v-if="danmakuCount">
        <VIcon icon="danmaku" :size="18"></VIcon>
        {{ danmakuCount }}
      </template>
    </div>
  </a>
</template>

<script lang="ts">
import {
  DpiImage,
  VIcon,
} from '@/ui'
import { getUID } from '@/core/utils'
import { watchlaterList, toggleWatchlater } from '@/core/watchlater'

/*
  ============
  祖 传 代 码
  ============
*/
export default {
  // props: ['data', 'orientation'],
  components: {
    DpiImage,
    VIcon,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
    orientation: {
      type: String,
      // 'vertical'可以竖过来
      default: 'horizontal',
    },
    showStats: {
      type: Boolean,
      default: true,
    },
    isNew: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      watchlaterList,
      upFaceUrl: '',
      danmakuCount: '',
      like: '',
      coins: '',
      favorites: '',
      dynamic: '',
      topics: [],
      upID: 0,
      epID: 0,
      cooperation: [],
      ...lodash.omit(this.data, 'watchlater'),
      watchlaterInit: this.data.watchlater,
    }
  },
  computed: {
    vertical() {
      return this.orientation === 'vertical'
    },
    watchlater() {
      if (getUID() && this.watchlaterInit !== null) {
        return this.watchlaterList.includes(this.aid)
      }
      return null
    },
    reversedCooperation() {
      return [...this.cooperation].reverse().slice(0, 3)
    },
  },
  methods: {
    toggleWatchlater,
  },
}
</script>

<style lang="scss" scoped>
.video-card {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  grid-template-areas:
    'cover title'
    'cover description'
    'cover up';
  height: var(--card-height);
  width: var(--card-width);
  color: black;
  background-color: #fff;
  $radius: 8px;
  border-radius: $radius;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #8882;
  box-sizing: border-box;
  margin-right: var(--card-margin);
  margin-bottom: var(--card-margin);
  position: relative;

  body.dark &,
  body.dark &:hover {
    background-color: #282828;
    color: #eee;
  }
  &:hover {
    color: black;
  }
  &.vertical {
    grid-template-columns: auto auto;
    grid-template-rows: 1fr auto auto;
    grid-template-areas:
      'cover cover'
      'title title'
      'up up';
    .description,
    .topics {
      display: none;
    }
    .cover-container {
      border-radius: $radius $radius 0 0;
    }
    .title {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      max-height: 3em;
      word-break: break-all;
      white-space: normal;
      line-height: 1.5;
      margin: 8px 0;
      font-size: 10pt;
    }
    .up {
      align-self: start;
      white-space: nowrap;
      .name {
        text-overflow: ellipsis;
        overflow: hidden;
      }
      &:not(.no-face) {
        margin-left: 8px;
        max-width: calc(var(--card-width) - 24px);
      }
      &.no-face {
        margin-top: 8px;
        max-width: calc(var(--card-width) - 24px);
      }
    }
    .cooperation {
      margin: 0 12px 8px 8px;
    }
    .stats {
      align-self: end;
      justify-self: start;
      margin-bottom: 6px;
      margin-right: 0;
    }
  }
  & > * {
    justify-self: self-start;
    align-self: center;
  }
  .publish-time-summary,
  .publish-time-detail,
  .duration,
  .watchlater {
    opacity: 0;
  }
  &:hover {
    .cover {
      transform: scale(1.05);
      transition: 0.1s cubic-bezier(0.39, 0.58, 0.57, 1);
    }
    .publish-time-summary,
    .duration,
    .watchlater {
      opacity: 1;
    }
  }
  .publish-time-summary:hover {
    opacity: 0;
    & ~ .publish-time-detail {
      opacity: 1;
    }
  }

  .cover-container {
    grid-area: cover;
    border-radius: $radius 0 0 $radius;
    position: relative;
    width: calc(var(--card-width) - 2px);
    height: calc(var(--card-width) / 20 * 12);
    overflow: hidden;
    .cover {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }
    & > :not(.cover) {
      position: absolute;
    }
    .publish-time-detail,
    .publish-time-summary,
    .duration,
    .watchlater {
      bottom: 6px;
      padding: 2px 8px;
      background-color: #000a;
      color: white;
      border-radius: 10px;
      height: 20px;
      box-sizing: border-box;
      .mdi {
        // font-size: 12pt;
        // line-height: 1;
        margin-right: 4px;
      }
    }
    .new {
      top: 6px;
      left: 6px;
      background-color: var(--theme-color);
      color: var(--foreground-color);
      font-weight: bold;
      padding: 2px 8px;
      border-radius: 10px;
      height: 20px;
      box-sizing: border-box;
    }
    .publish-time-detail {
      z-index: 0;
    }
    .publish-time-summary {
      z-index: 1;
    }
    .publish-time-detail,
    .publish-time-summary {
      top: 6px;
      right: 6px;
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
    padding: 0 10px;
    white-space: nowrap;
    overflow: hidden;
    justify-self: stretch;
    text-overflow: ellipsis;
    &:hover {
      color: var(--theme-color);
    }
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
      white-space: nowrap;
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      &:hover {
        background-color: #8884;
        color: var(--theme-color);
      }
    }
  }
  .description {
    grid-area: description;
    color: inherit;
    overflow: hidden;
    align-self: stretch;
    justify-self: stretch;
    margin: 0 12px;
    line-height: 1.5;
    height: 3em;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
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
  .cooperation,
  .up,
  .stats {
    grid-area: up;
  }
  @mixin face-image {
    &.no-face {
      background-color: transparent;
      padding: 0;
      .be-icon {
        font-size: 14pt;
        opacity: 0.75;
      }
    }
    .face {
      border-radius: 50%;
      width: 24px;
      height: 24px;
    }
  }
  .up {
    margin-left: 12px;
    display: flex;
    align-items: center;
    padding: 2px;
    background-color: transparent;
    border: 1px solid #8882;
    box-sizing: border-box;
    border-radius: 15px;
    color: inherit;
    .name {
      margin: 0 8px;
    }
    @include face-image();
    &:not(.no-face):hover {
      background-color: #8882;
    }
    &:hover {
      .name,
      .be-icon {
        color: var(--theme-color);
      }
    }
  }
  &.no-stats .up {
    margin-bottom: 8px;
  }
  .cooperation {
    margin-left: 12px;
    display: flex;
    align-items: center;
    justify-self: stretch;
    justify-content: space-between;
    &-ups {
      display: flex;
      flex-direction: row-reverse;
      align-items: center;
      justify-content: flex-start;
      .cooperation-up {
        @include face-image();
        flex: 0 0 15px;
        width: 15px;
        display: flex;
        .face {
          border: 1px solid #8882;
          padding: 2px;
          background-color: #fff;
          body.dark & {
            background-color: #282828;
          }
        }
      }
      &:hover .cooperation-up {
        flex-basis: auto;
        width: 30px;
        margin-right: 4px;
      }
    }
    &-note {
      opacity: .5;
    }
  }
  .stats {
    justify-self: self-end;
    margin-right: 12px;
    display: flex;
    align-items: center;
    opacity: 0.5;
    .be-icon {
      // font-size: 12pt;
      margin: 0 4px 0 12px;
      // &.be-iconfont-favorites-outline {
      //   font-size: 14pt;
      // }
      // &.be-iconfont-coin-outline {
      //   font-size: 11pt;
      // }
    }
  }
}
</style>

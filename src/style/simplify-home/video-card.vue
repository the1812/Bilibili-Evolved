<template>
  <a class="video-card" target="_blank" :href="'https://www.bilibili.com/av' + aid">
    <div class="cover-container">
      <dpi-img class="cover" :src="coverUrl" :size="{height: 120, width: 200}"></dpi-img>
      <div class="duration">{{durationText}}</div>
      <div class="watchlater" @click.stop.prevent="toggleWatchlater()">
        <i class="mdi" :class="{'mdi-clock-outline': !watchlater, 'mdi-check-circle': watchlater}"></i>
        {{watchlater ? '已添加' : '稍后再看'}}
      </div>
    </div>
    <h1 class="title" :title="title">{{title}}</h1>
    <div class="topics" v-if="topics && topics.length">
      <a
        class="topic"
        v-for="topic of topics.slice(0,3)"
        :key="topic.id"
        target="_blank"
        :href="'https://t.bilibili.com/topic/name/' + topic.name + '/feed'"
      >#{{topic.name}}#</a>
    </div>
    <pre class="description single-line" :title="description" v-else>{{description}}</pre>
    <a
      class="up"
      :class="{'no-face': !upFaceUrl}"
      target="_blank"
      :href="'https://space.bilibili.com/' + upID"
    >
      <dpi-img v-if="upFaceUrl" class="face" :src="upFaceUrl" :size="24"></dpi-img>
      <Icon v-else icon="up" type="extended"></Icon>
      <div class="name" :title="upName">{{upName}}</div>
    </a>
    <div class="stats">
      <template v-if="like">
        <Icon type="extended" icon="like-outline"></Icon>
        {{like}}
      </template>
      <template v-if="coins">
        <Icon type="home" icon="coin-outline"></Icon>
        {{coins}}
      </template>
      <template v-if="favorites">
        <Icon type="home" icon="favorites-outline"></Icon>
        {{favorites}}
      </template>
      <Icon type="extended" icon="play"></Icon>
      {{playCount}}
      <template v-if="danmakuCount">
        <Icon type="extended" icon="danmaku"></Icon>
        {{danmakuCount}}
      </template>
    </div>
  </a>
</template>

<script lang="ts">
export interface VideoCardInfo {
  id: string
  aid: number
  title: string
  upID: number
  upName: string
  upFaceUrl?: string
  coverUrl: string
  description: string
  duration?: number
  durationText: string
  playCount: string
  danmakuCount?: string
  dynamic?: string
  like?: string
  coins?: string
  favorites?: string
  timestamp?: number
  time?: Date
  topics?: {
    id: number
    name: string
  }[]
  watchlater: boolean
}
export default {
  props: ['data'],
  components: {
    'dpi-img': () => import('../dpi-img.vue'),
    Icon: () => import('../icon.vue')
  },
  data() {
    return {
      upFaceUrl: '',
      danmakuCount: '',
      like: '',
      coins: '',
      favorites: '',
      dynamic: '',
      topics: [],
      ...this.data
    } as VideoCardInfo
  },
  methods: {
    async toggleWatchlater() {
      try {
        this.watchlater = !this.watchlater
        const { toggleWatchlater: toggle } = await import(
          '../../video/watchlater-api'
        )
        toggle(this.aid.toString(), this.watchlater)
      } catch (error) {
        this.watchlater = !this.watchlater
        Toast.error(error.message, '稍后再看操作失败', 3000)
      }
    }
  }
}
</script>

<style lang="scss">
.video-card {
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
      &.be-iconfont-favorites-outline {
        font-size: 14pt;
      }
      &.be-iconfont-coin-outline {
        font-size: 11pt;
      }
    }
  }
}
</style>
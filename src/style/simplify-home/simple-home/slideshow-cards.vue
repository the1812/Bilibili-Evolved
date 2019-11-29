<template>
  <div class="slideshow-cards">
    <div class="error" v-if="error"></div>
    <template v-if="!error && cards.length >= 7">
      <a
        class="slideshow-card"
        target="_blank"
        v-for="card of cardQueue"
        :key="card.id"
        :href="'https://www.bilibili.com/av' + card.aid"
        :title="card.title"
      >
        <img :src="card.coverUrl" :alt="card.title" />
      </a>
      <div class="operations">
        <a class="play" title="播放" target="_blank" :href="'https://www.bilibili.com/av' + currentCard.aid">
          <icon type="home" icon="play-triangle"></icon>
        </a>
        <button
          class="watchlater"
          :class="{checked: currentCard.watchlater}"
          v-if="currentCard.watchlater !== null"
          :title="currentCard.watchlater ? '已添加至稍后再看' : '稍后再看'"
          @click="toggleWatchlater(currentCard)"
        >
          <icon type="mdi" icon="clock-outline"></icon>
        </button>
      </div>
      <div class="info">
        <a
          class="title"
          target="_blank"
          :title="currentCard.title"
          :href="'https://www.bilibili.com/av' + currentCard.aid"
        >{{currentCard.title}}</a>
        <a class="up" target="_blank" :href="'https://space.bilibili.com/' + currentCard.upID">
          <dpi-img :size="24" :src="currentCard.upFaceUrl" :alt="currentCard.upName" class="face"></dpi-img>
          {{currentCard.upName}}
        </a>

        <div class="stat">
          <icon type="extended" icon="play"></icon>
          <div class="number">{{currentCard.playCount | bigNumber}}</div>
          <icon type="extended" icon="danmaku"></icon>
          <div class="number">{{currentCard.danmakuCount | bigNumber}}</div>
          <icon type="extended" icon="like"></icon>
          <div class="number">{{currentCard.like | bigNumber}}</div>
          <icon type="extended" icon="coin"></icon>
          <div class="number">{{currentCard.coins | bigNumber}}</div>
        </div>
        <div class="description" :title="currentCard.description">{{currentCard.description}}</div>
        <div class="buttons">
          <button class="previous" @click="previousCard()" title="上一个">
            <icon type="extended" icon="left-arrow"></icon>
          </button>
          <button class="next" @click="nextCard()">
            下一个
            <icon type="extended" icon="right-arrow"></icon>
          </button>
        </div>
      </div>
    </template>
    <div class="area-header">{{title}}</div>
  </div>
</template>

<script lang="ts">
import { VideoCardInfo } from '../video-card-info'
export default {
  components: {
    Icon: () => import('../../icon.vue'),
    DpiImg: () => import('../../dpi-img.vue'),
  },
  filters: {
    bigNumber(value: number) {
      return formatCount(value)
    }
  },
  props: ['cards', 'error', 'title'],
  data() {
    return {
      cardQueue: []
    }
  },
  methods: {
    regenerateQueue() {
      if (this.cards.length < 7) {
        return
      }
      const cardQueue = [...this.cards]
      cardQueue.unshift(cardQueue.pop())
      this.cardQueue = cardQueue
      console.log(cardQueue)
    },
    previousCard() {
      this.cardQueue.unshift(this.cardQueue.pop())
    },
    nextCard() {
      this.cardQueue.push(this.cardQueue.shift())
    },
    async toggleWatchlater(card: VideoCardInfo) {
      try {
        card.watchlater = !card.watchlater
        const { toggleWatchlater } = await import(
          '../../../video/watchlater-api'
        )
        await toggleWatchlater(card.aid!.toString(), card.watchlater)
      } catch (error) {
        card.watchlater = !card.watchlater
        logError(error)
      }
    }
  },
  watch: {
    cards() {
      this.regenerateQueue()
    }
  },
  computed: {
    currentCard() {
      return this.cardQueue[1]
    }
  },
  mounted() {
    this.regenerateQueue()
  }
}
</script>

<style lang="scss">
.slideshow-cards {
  @mixin max-line($line, $line-height: 1.5) {
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    -webkit-line-clamp: $line;
    -webkit-box-orient: vertical;
    line-height: $line-height;
    max-height: #{$line * $line-height}em;
  }
  @mixin round-button {
    background-color: #ddd;
    border-radius: 50%;
    border: none;
    display: flex;
    height: 32px;
    width: 32px;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    margin-right: 8px;
    cursor: pointer;
    &:hover {
      background-color: #ccc;
    }
    body.dark & {
      background-color: #333;
      &:hover {
        background-color: #444;
      }
    }
    &.checked {
      border: 2px solid var(--theme-color);
    }
  }
  display: grid;
  position: relative;
  --card-height: 300px;
  --card-width: 500px;
  grid-template:
    'header header header' auto
    'cards operations info' var(--card-height) / var(--card-width) 1fr calc(1.2 *
        var(--card-width));
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
  .error {
    grid-column: 1 / 4;
    grid-row: 2 / 3;
    align-self: stretch;
    justify-self: stretch;
  }
  .operations {
    grid-area: operations;
    display: flex;
    flex-direction: column;
    align-self: center;
    justify-self: end;
    margin-right: 8px;
    & > * {
      @include round-button();
      .be-icon {
        font-size: 22px;
      }
      &:not(:last-child) {
        margin-bottom: 8px;
      }
    }
    .play {
      .be-icon {
        font-size: 16px;
        transform: translateX(1.5px);
      }
      &,
      body.dark & {
        color: var(--foreground-color);
        background-color: var(--theme-color);
        &:hover {
          background-color: var(--theme-color-80);
        }
      }
    }
  }
  .info {
    grid-area: info;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
    & > * {
      display: flex;
      align-items: center;
    }
    .title {
      color: inherit !important;
      font-size: 12pt;
      font-weight: bold;
      line-height: normal;
      @include max-line(2);
    }
    .up {
      font-size: 10pt;
      color: inherit !important;
      .face {
        border-radius: 50%;
        width: 24px;
        height: 24px;
        margin-right: 8px;
      }
    }
    .stat {
      opacity: 0.75;
      align-items: center;
      .be-icon {
        margin: 0 4px 0 16px;
        font-size: 12pt;
      }
    }
    .description {
      @include max-line(6);
      flex-grow: 1;
      white-space: pre-wrap;
      text-align: right;
      opacity: 0.75;
    }
    .buttons {
      .be-icon {
        font-weight: normal;
      }
      & > button {
        outline: none !important;
        cursor: pointer;
      }
      .previous {
        @include round-button();
        .be-icon {
          transform: translateX(-1px);
        }
      }
      .next {
        display: flex;
        align-items: center;
        padding: 4px 6px 4px 12px;
        background-color: var(--theme-color);
        border: none;
        color: var(--foreground-color);
        height: 32px;
        box-sizing: border-box;
        line-height: normal;
        font-size: 11pt;
        font-weight: bold;
        border-radius: 16px;
        &:hover {
          background-color: var(--theme-color-80);
        }
      }
    }
  }
  .slideshow-card {
    grid-area: cards;
    cursor: pointer;
    align-self: stretch;
    justify-self: stretch;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #8882;
    border-radius: 16px;
    &:not(:first-child) {
      transform-origin: right;
    }
    &:not(:nth-child(2)) {
      pointer-events: none;
      transform: translateX(39px) scale(0.45);
      opacity: 0;
    }
    img {
      border-radius: 16px;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  @for $i from 1 to 8 {
    .slideshow-card:nth-child(#{$i}) {
      z-index: #{8 - $i};
    }
  }
  .slideshow-card:first-child {
    transform: translateX(-10%) scale(1.1);
    opacity: 0;
  }
  .slideshow-card:nth-child(2) {
    pointer-events: initial;
  }
  .slideshow-card:nth-child(3) {
    transform: translateX(20px) scale(0.9);
    opacity: 0.5;
  }
  .slideshow-card:nth-child(4) {
    transform: translateX(30px) scale(0.75);
    opacity: 0.25;
  }
  .slideshow-card:nth-child(5) {
    transform: translateX(35px) scale(0.65);
    opacity: 0.125;
  }
  .slideshow-card:nth-child(6) {
    transform: translateX(37.5px) scale(0.5);
    opacity: 0.0625;
  }
  @media screen and (max-width: 1400px) {
    & {
      --card-height: 200px;
      --card-width: 330px;
      grid-template-columns: var(--card-width) 1fr calc(1.4 * var(--card-width));
    }
    .info {
      .title {
        @include max-line(1);
      }
      .description {
        @include max-line(3);
      }
    }
  }
}
</style>
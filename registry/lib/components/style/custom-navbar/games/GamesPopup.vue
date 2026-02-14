<script setup lang="ts">
import { ref } from 'vue'
import { VLoading } from '@/ui'
import type { GameInfo } from './types'
import { bilibiliApi, getJson } from '@/core/ajax'
import { usePopper } from '../mixins'
import { CustomNavbarItem } from '../custom-navbar-item'

const props = defineProps<{
  item: CustomNavbarItem
  container: HTMLElement
}>()
const popper = usePopper(props)

const gameInfo = ref<GameInfo | undefined>(undefined)
const loading = ref(true)
const loadGameInfo = async () => {
  if (gameInfo.value !== undefined) {
    return
  }
  const response = await bilibiliApi<GameInfo>(
    getJson('https://le3-api.game.bilibili.com/pc/game/nav/info'),
  )
  gameInfo.value = response
  loading.value = false
}

defineExpose({
  popupShow() {
    popper.popupShow()
    loadGameInfo()
  },
})
</script>
<template>
  <div class="custom-navbar-games-popup">
    <div v-if="loading" class="loading-container">
      <VLoading />
    </div>
    <div v-if="gameInfo" class="custom-navbar-games-panel">
      <div class="custom-navbar-games-left-panel">
        <a class="banner-game-card" :href="gameInfo.banner.href" :title="gameInfo.banner.title">
          <img :src="gameInfo.banner.poster" :alt="gameInfo.banner.title" />
          <div class="banner-game-card-title">
            {{ gameInfo.banner.title }}
          </div>
        </a>
        <div class="panel-game-cards">
          <a
            v-for="card of gameInfo.panel"
            :key="card.href"
            class="panel-game-card"
            :href="card.href"
            :title="card.title"
          >
            <img :src="card.poster" :alt="card.title" />
            <div class="panel-game-card-title">
              {{ card.title }}
            </div>
          </a>
        </div>
      </div>
      <div class="custom-navbar-games-panel-separator"></div>
      <div class="custom-navbar-games-right-panel">
        <div class="list-game-cards-title">新游预告</div>
        <div class="list-game-cards">
          <a
            v-for="card of gameInfo.list.slice(0, 8)"
            :key="card.href"
            class="list-game-card"
            :href="card.href"
            :title="card.title"
          >
            {{ card.title }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
@import 'common';

.custom-navbar-games-popup {
  width: 420px;
  font-size: 12px;
  $gap: 12px;
  @include v-stretch();
  .loading-container {
    flex-grow: 1;
    @include v-center();
    justify-content: center;
    height: 240px;
    font-size: 14px;
  }
  .custom-navbar-games-panel {
    @include h-stretch($gap);
    padding: $gap;
  }
  .custom-navbar-games-left-panel {
    flex-basis: 60%;
    min-width: 0;
    @include v-stretch($gap);
    .banner-game-card {
      position: relative;
      overflow: hidden;
      background-color: #8882;
      @include v-stretch();
      @include round-corner();
      img {
        transition: transform 0.2s ease-out;
        aspect-ratio: 15 / 8;
      }
      &:hover img {
        transform: scale(1.05);
      }
      &-title {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        font-size: 12px;
        color: #fff;
        padding: 8px;
        background-image: linear-gradient(to top, #0008, transparent);
      }
    }
    .panel-game-cards {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: $gap;
      .panel-game-card {
        @include v-stretch(6px);
        min-width: 0;
        transition: color 0.2s ease-out;
        img {
          background-color: #8882;
          border-radius: 16px;
          aspect-ratio: 1 / 1;
        }
        &:hover {
          color: var(--theme-color) !important;
        }
        &-title {
          @include max-line(2);
          text-align: center;
        }
      }
    }
  }
  .custom-navbar-games-right-panel {
    min-width: 0;
    flex: 1;
    @include v-stretch($gap);
    padding: 6px 4px;
    .list-game-cards-title {
      font-size: large;
      @include semi-bold();
      body.dark & {
        color: var(--be-color-text-title, #eee);
      }
    }
    .list-game-cards {
      @include v-stretch();
      body.dark & {
        color: var(--be-color-text-content, #aaa);
      }
      .list-game-card {
        @include single-line();
        padding: 4px 0;
        opacity: 0.6;
        transition: all 0.2s ease-out;
        &:hover {
          color: var(--theme-color) !important;
          opacity: 1;
        }
      }
    }
  }
  .custom-navbar-games-panel-separator {
    width: 1px;
    background-color: #8882;
  }
}
</style>

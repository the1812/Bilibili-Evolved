<script setup lang="ts">
import { ref } from 'vue'
import { VLoading } from '@/ui'
import { bilibiliApi } from '@/core/ajax'
import { CustomNavbarItem } from '../custom-navbar-item'
import { usePopper } from '../mixins'
import type { MangaRecommendItem, MangaHotItem } from './types'

const props = defineProps<{
  item: CustomNavbarItem
  container: HTMLElement
}>()
const popper = usePopper(props)

const loading = ref(true)
const recommendItems = ref<MangaRecommendItem[] | undefined>(undefined)
const hotItems = ref<MangaHotItem[] | undefined>(undefined)
const previewCard = ref<MangaHotItem | undefined>(undefined)
const loadRecommendItems = async () => {
  if (recommendItems.value !== undefined) {
    return
  }
  recommendItems.value = await bilibiliApi<MangaRecommendItem[]>(
    fetch('https://manga.bilibili.com/twirp/comic.v1.Comic/Recommend?device=pc&platform=web', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        JsonData: JSON.stringify([
          {
            pool_id: 500003,
            num: 4,
          },
        ]),
      }),
    }).then(r => r.json()),
  )
}
const loadHotItems = async () => {
  if (hotItems.value !== undefined) {
    return
  }
  hotItems.value = await bilibiliApi<MangaHotItem[]>(
    fetch('https://manga.bilibili.com/twirp/comic.v1.Comic/HomeHot?device=pc&platform=web', {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 0 }),
      method: 'POST',
    }).then(r => r.json()),
  )
}
const loadMangaInfo = async () => {
  await Promise.all([loadRecommendItems(), loadHotItems()])
  loading.value = false
}

defineExpose({
  popupShow() {
    popper.popupShow()
    loadMangaInfo()
  },
})
</script>
<template>
  <div class="custom-navbar-manga-popup">
    <div v-if="loading" class="loading-container">
      <VLoading />
    </div>
    <div v-if="!loading" class="custom-navbar-manga-panel">
      <div class="custom-navbar-manga-left-panel">
        <a
          v-for="card of recommendItems"
          :key="card.season_id"
          class="recommend-manga-card"
          :href="'https://manga.bilibili.com/detail/mc' + card.season_id"
        >
          <div class="recommend-manga-card-image">
            <img :src="card.horizontal_cover + '@300w.jpg'" :alt="card.title" />
          </div>
          <div class="recommend-manga-card-title" :title="card.title">{{ card.title }}</div>
        </a>
      </div>
      <div class="custom-navbar-manga-panel-separator"></div>
      <div class="custom-navbar-manga-right-panel">
        <div class="custom-navbar-manga-hot-title">人气漫画</div>
        <div class="custom-navbar-manga-hot-list">
          <a
            v-for="card of hotItems.slice(0, 7)"
            :key="card.comic_id"
            class="hot-manga-card"
            :title="card.title"
            :href="'https://manga.bilibili.com/detail/mc' + card.comic_id"
            @mouseenter="previewCard = card"
            @mouseleave="previewCard = undefined"
          >
            <div class="hot-manga-card-title">
              {{ card.title }}
            </div>
          </a>
        </div>
        <div v-if="previewCard" class="hot-manga-card-preview">
          <img :src="previewCard.vertical_cover + '@450h.jpg'" :alt="previewCard.title" />
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
@import 'common';

.custom-navbar-manga-popup {
  width: 500px;
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
  .custom-navbar-manga-panel {
    @include h-stretch($gap);
    padding: $gap;
    .custom-navbar-manga-left-panel {
      min-width: 0;
      flex: 0 0 65%;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: $gap;
      .recommend-manga-card {
        @include v-stretch(8px);
        .recommend-manga-card-image {
          @include v-stretch();
          @include round-corner();
          background: #8882;
          aspect-ratio: 16 / 9;
          width: 100%;
          overflow: hidden;
        }
        &:hover img {
          transform: scale(1.05);
        }
        &-title {
          @include single-line();
        }
        &:hover {
          color: var(--theme-color) !important;
        }
      }
    }
    .custom-navbar-manga-right-panel {
      position: relative;
      min-width: 0;
      flex: 1;
      @include v-stretch($gap);
      padding: 6px 4px;
      .custom-navbar-manga-hot-title {
        font-size: large;
        @include semi-bold();
      }
      .custom-navbar-manga-hot-list {
        @include v-stretch();
        counter-reset: manga-item;
        .hot-manga-card {
          @include h-center(6px);
          padding: 4px 0;
          &-title {
            @include single-line();
            transition: color 0.2s ease-out, opacity 0.2s ease-out;
            opacity: 0.6;
            min-width: 0;
            max-width: 100%;
            flex: 1 0 0;
          }
          &::before {
            counter-increment: manga-item;
            content: counter(manga-item);
            @include semi-bold();
            opacity: 0.6;
            font-style: italic;
            font-size: 14px;
          }
          &:hover .hot-manga-card-title {
            color: var(--theme-color) !important;
            opacity: 1;
          }
          &:nth-child(1)::before {
            opacity: 1;
            color: #e64747;
          }
          &:nth-child(2)::before {
            opacity: 1;
            color: #ff6e42;
          }
          &:nth-child(3)::before {
            opacity: 1;
            color: #ff9900;
          }
        }
      }
      .hot-manga-card-preview {
        position: absolute;
        pointer-events: none;
        top: calc(-1 * #{$gap});
        right: calc(100% + #{$gap} + 1px);
        height: calc(100% - #{$gap});
        background-image: linear-gradient(to left, #fff 75%, transparent);
        padding: 18px 18px 18px 60px;
        body.dark & {
          background-image: linear-gradient(to left, #222 75%, transparent);
        }
        img {
          display: flex;
          background: #8882;
          height: 100%;
          aspect-ratio: 169 / 225;
          @include round-corner();
        }
      }
    }
    .custom-navbar-manga-panel-separator {
      width: 1px;
      background-color: #8882;
    }
  }
}
</style>

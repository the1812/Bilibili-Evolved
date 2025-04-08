<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { VLoading, VButton } from '@/ui'
import { bilibiliApi, getJsonWithCredentials, postTextWithCredentials } from '@/core/ajax'
import { CustomNavbarItem } from '../custom-navbar-item'
import { usePopper } from '../mixins'
import type { MatchInfo, MatchPreviewItem } from './types'
import { getCsrf } from '@/core/utils'
import { logError } from '@/core/utils/log'

const props = defineProps<{
  item: CustomNavbarItem
  container: HTMLElement
}>()
const popper = usePopper(props)

const loading = ref(true)
const matchInfo = ref<MatchInfo | undefined>(undefined)
const bannerItems = computed(() => matchInfo.value?.banner)
const hotItems = computed(() => matchInfo.value?.hot)
const previewItems = computed(() => matchInfo.value?.preview)
const loadMatchInfo = async () => {
  matchInfo.value = reactive(
    await bilibiliApi<MatchInfo>(
      getJsonWithCredentials('https://api.bilibili.com/x/web-interface/nav/game'),
    ),
  )
  loading.value = false
}
const toggleSubscribe = async (card: MatchPreviewItem) => {
  const isSubscribed = card.fav_status !== 0
  try {
    await postTextWithCredentials(
      isSubscribed
        ? 'https://api.bilibili.com/x/esports/fav/del'
        : 'https://api.bilibili.com/x/esports/fav/add',
      new URLSearchParams({
        cid: card.cid.toString(),
        csrf: getCsrf(),
      }).toString(),
    )
    if (isSubscribed) {
      card.fav_status = 0
    } else {
      card.fav_status = 1
    }
  } catch (error) {
    logError(error)
  }
}

defineExpose({
  popupShow() {
    popper.popupShow()
    loadMatchInfo()
  },
})
</script>
<template>
  <div class="custom-navbar-match-popup">
    <div v-if="loading" class="loading-container">
      <VLoading />
    </div>
    <div v-if="!loading" class="custom-navbar-match-panel">
      <div class="custom-navbar-match-left-panel">
        <a
          v-for="card of bannerItems"
          :key="card.jump_url"
          class="banner-match-card"
          :href="card.jump_url"
        >
          <img :src="card.cover" />
        </a>
      </div>
      <div class="custom-navbar-match-panel-separator"></div>
      <div class="custom-navbar-match-right-panel">
        <div class="hot-match-list">
          <div class="hot-match-list-title">热门赛事</div>
          <a
            v-for="card of hotItems"
            :key="card.jump_url"
            :href="card.jump_url"
            :title="card.name"
            class="hot-match-card"
          >
            <div class="hot-match-card-title">
              {{ card.name }}
            </div>
          </a>
        </div>
        <div class="preview-match-list">
          <div class="preview-match-list-title">精彩预告</div>
          <a
            v-for="card of previewItems"
            :key="card.jump_url"
            :href="card.jump_url"
            :title="card.name"
            class="preview-match-card"
          >
            <!-- spell-checker: disable-next-line -->
            <div class="preview-match-date">{{ card.stime }}</div>
            <div class="preview-match-title">{{ card.name }}</div>
            <VButton
              class="preview-match-subscribe"
              :type="card.fav_status === 0 ? 'primary' : 'light'"
              @click.prevent="toggleSubscribe(card)"
            >
              {{ card.fav_status === 0 ? '订阅' : '已订阅' }}
            </VButton>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
@import 'common';

.custom-navbar-match-popup {
  width: 650px;
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

  .custom-navbar-match-panel {
    @include h-stretch($gap);
    padding: $gap;
    .custom-navbar-match-left-panel {
      min-width: 0;
      flex: 0 0 45%;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: $gap;
      .banner-match-card {
        overflow: hidden;
        @include round-corner(6px);
        &:first-child {
          grid-column: 1 / 3;
        }
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          background: #8882;
          aspect-ratio: 16 / 9;
          transition: transform 0.2s ease-out;
        }
        &:hover img {
          transform: scale(1.05);
        }
      }
    }
    .custom-navbar-match-panel-separator {
      width: 1px;
      background-color: #8882;
    }
    .custom-navbar-match-right-panel {
      @include v-stretch($gap);
      justify-content: space-between;
      min-width: 0;
      flex: 1;
      padding: 6px 4px;

      .hot-match-list-title,
      .preview-match-list-title {
        font-size: large;
        @include semi-bold();
        margin-bottom: 6px;
      }
      .hot-match-list,
      .preview-match-list {
        @include v-stretch();
        counter-reset: match-item;
      }
      .hot-match-card {
        @include h-center(6px);
        padding: 5px 0;
        &-title {
          @include single-line();
          transition: color 0.2s ease-out;
          min-width: 0;
          max-width: 100%;
          flex: 1 0 0;
        }
        &::before {
          counter-increment: match-item;
          content: counter(match-item);
          @include semi-bold();
          font-style: italic;
          font-size: 14px;
        }
        &:hover .hot-match-card-title {
          color: var(--theme-color) !important;
        }
        &:nth-child(2)::before {
          color: #e64747;
        }
        &:nth-child(3)::before {
          color: #ff6e42;
        }
        &:nth-child(4)::before {
          color: #ff9900;
        }
      }
      .preview-match-card {
        @include h-center(4px);
        padding: 5px 0;
        .preview-match-date {
          opacity: 0.6;
        }
        .preview-match-title {
          flex: 1 0 0;
          @include single-line();
        }
        .preview-match-subscribe.be-button {
          padding: 2px 6px;
          font-size: 11px;
        }
        &:hover .preview-match-title {
          color: var(--theme-color);
        }
      }
    }
  }
}
</style>
